const dataStore = require('./dataStore');

/**
 * In-app Notification & Response Dispatcher Service
 */
const notificationService = {
  /**
   * Dispatch a blood request notification to a specific donor
   */
  async notifyDonor({ donorUserId, hospitalUserId, bloodRequest }) {
    const notif = await dataStore.createNotification({
      recipientUserId: donorUserId,
      senderUserId: hospitalUserId,
      requestId: bloodRequest._id,
      title: `Emergency Blood Request: ${bloodRequest.bloodGroup}`,
      message: `${bloodRequest.hospitalName} urgently requires ${bloodRequest.unitsRequired} unit(s) of ${bloodRequest.bloodGroup} blood (Urgency: ${bloodRequest.urgency}). Are you able to donate?`,
      type: 'DONOR_REQUEST',
      responseStatus: 'Pending',
      actionPayload: {
        requestId: bloodRequest._id,
        bloodGroup: bloodRequest.bloodGroup,
        unitsRequired: bloodRequest.unitsRequired,
        urgency: bloodRequest.urgency,
        hospitalName: bloodRequest.hospitalName,
        contactPhone: bloodRequest.contactPhone,
        address: bloodRequest.location?.address,
      },
    });

    // Update BloodRequest notifiedDonors array
    const donorUser = await dataStore.findUserById(donorUserId);
    const updatedNotified = [
      ...(bloodRequest.notifiedDonors || []),
      {
        donorUserId,
        donorName: donorUser ? donorUser.name : 'Registered Donor',
        status: 'Pending',
        sentAt: new Date(),
      },
    ];

    await dataStore.updateBloodRequest(bloodRequest._id, {
      notifiedDonors: updatedNotified,
      status: 'Contacted',
    });

    dataStore.addAuditLog(
      'DONOR_NOTIFIED',
      `Hospital ${bloodRequest.hospitalName} notified donor ${donorUser ? donorUser.name : donorUserId} for ${bloodRequest.bloodGroup}.`
    );

    return notif;
  },

  /**
   * Process a donor's response (Accept or Decline)
   */
  async processDonorResponse({ notificationId, donorUserId, responseStatus }) {
    const notif = await dataStore.updateNotificationResponse(
      notificationId,
      responseStatus
    );
    if (!notif) {
      throw new Error('Notification not found.');
    }

    const donorUser = await dataStore.findUserById(donorUserId);
    const donorProfile = await dataStore.findDonorByUserId(donorUserId);

    // If attached to a BloodRequest, update donor response status
    if (notif.requestId) {
      const request = await dataStore.findBloodRequestById(notif.requestId);
      if (request) {
        const updatedList = (request.notifiedDonors || []).map((item) => {
          if (String(item.donorUserId) === String(donorUserId)) {
            return {
              ...item,
              status: responseStatus,
              respondedAt: new Date(),
            };
          }
          return item;
        });

        await dataStore.updateBloodRequest(request._id, {
          notifiedDonors: updatedList,
          status: responseStatus === 'Accepted' ? 'Contacted' : request.status,
        });

        // Notify the Hospital about the donor's decision
        await dataStore.createNotification({
          recipientUserId: request.hospitalUserId,
          senderUserId: donorUserId,
          requestId: request._id,
          title: `Donor Response: ${responseStatus.toUpperCase()}`,
          message:
            responseStatus === 'Accepted'
              ? `Donor ${donorUser.name} (${donorProfile ? donorProfile.bloodGroup : 'Matched'}) has ACCEPTED your request for ${request.bloodGroup}! Direct Contact: ${donorProfile && donorProfile.consentShareContact ? donorUser.phone : 'Requested approval'}.`
              : `Donor ${donorUser.name} declined or is currently unable to donate for this request.`,
          type: responseStatus === 'Accepted' ? 'DONOR_ACCEPTED' : 'DONOR_DECLINED',
          actionPayload: {
            donorName: donorUser.name,
            bloodGroup: donorProfile ? donorProfile.bloodGroup : '',
            donorPhone:
              donorProfile && donorProfile.consentShareContact
                ? donorUser.phone
                : 'Masked - Contact Hospital Desk',
            requestId: request._id,
          },
        });
      }
    }

    dataStore.addAuditLog(
      'DONOR_RESPONSE',
      `Donor ${donorUser ? donorUser.name : donorUserId} responded ${responseStatus}.`
    );

    return notif;
  },

  /**
   * Inquire with Blood Bank
   */
  async inquireBloodBank({ bloodBankUserId, hospitalUserId, bloodRequest, units }) {
    const bankUser = await dataStore.findUserById(bloodBankUserId);
    const bankProfile = await dataStore.findBloodBankByUserId(bloodBankUserId);

    const notif = await dataStore.createNotification({
      recipientUserId: bloodBankUserId,
      senderUserId: hospitalUserId,
      requestId: bloodRequest._id,
      title: `Hospital Inventory Inquiry: ${units} Unit(s) of ${bloodRequest.bloodGroup}`,
      message: `${bloodRequest.hospitalName} has initiated a priority inquiry for ${units} unit(s) of ${bloodRequest.bloodGroup} blood.`,
      type: 'BLOODBANK_INQUIRY',
      responseStatus: 'Pending',
      actionPayload: {
        requestId: bloodRequest._id,
        hospitalName: bloodRequest.hospitalName,
        bloodGroup: bloodRequest.bloodGroup,
        unitsRequested: units,
        emergencyContact: bloodRequest.contactPhone,
      },
    });

    const contactedList = [
      ...(bloodRequest.contactedBloodBanks || []),
      {
        bloodBankId: bankProfile ? bankProfile._id : null,
        bloodBankName: bankProfile ? bankProfile.bloodBankName : 'Blood Bank',
        status: 'Inquired',
        unitsRequested: units,
        sentAt: new Date(),
      },
    ];

    await dataStore.updateBloodRequest(bloodRequest._id, {
      contactedBloodBanks: contactedList,
      status: 'Contacted',
    });

    dataStore.addAuditLog(
      'BLOOD_BANK_INQUIRY',
      `Hospital ${bloodRequest.hospitalName} contacted blood bank ${bankProfile ? bankProfile.bloodBankName : bloodBankUserId}.`
    );

    return notif;
  },
};

module.exports = notificationService;

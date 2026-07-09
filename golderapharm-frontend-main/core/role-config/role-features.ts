import { UserRole } from "@/lib/types";

export type RoleFeatures = {
  doctors: {
    canAdd: boolean;
    canEdit: boolean;
    canInactive: boolean;
    canRemove: boolean;
    canView: boolean;
  };
  visits: {
    addToDoctorProfile: boolean;
    canScheduleVisit: boolean;
  };
  pharmacies: {
    canAdd: boolean;
    canEdit: boolean;
    canView: boolean;
  };
  sales: {
    canUpload: boolean;
    canView: boolean;
  };
  products: {
    canAdd: boolean;
    canEdit: boolean;
    canView: boolean;
  };
};

export const roleFeatureMap: Record<UserRole, RoleFeatures> = {
  MANAGER: {
    doctors: {
      canAdd: true,
      canEdit: true,
      canInactive: true,
      canRemove: true,
      canView: true,
    },
    visits: {
      addToDoctorProfile: false,
      canScheduleVisit: true,
    },
    pharmacies: {
      canAdd: true,
      canEdit: true,
      canView: true,
    },
    sales: {
      canUpload: true,
      canView: true,
    },
    products: {
      canAdd: true,
      canEdit: true,
      canView: true,
    },
  },
  SUPERVISOR: {
    doctors: {
      canAdd: false,
      canEdit: false,
      canInactive: true,
      canRemove: false,
      canView: true,
    },
    visits: {
      addToDoctorProfile: true,
      canScheduleVisit: true,
    },
    pharmacies: {
      canAdd: false,
      canEdit: false,
      canView: true,
    },
    sales: {
      canUpload: false,
      canView: true,
    },
    products: {
      canAdd: false,
      canEdit: false,
      canView: true,
    },
  },
  MEDICAL_REP: {
    doctors: {
      canAdd: false,
      canEdit: false,
      canInactive: false,
      canRemove: false,
      canView: true,
    },
    visits: {
      addToDoctorProfile: false,
      canScheduleVisit: true,
    },
    pharmacies: {
      canAdd: false,
      canEdit: false,
      canView: true,
    },
    sales: {
      canUpload: false,
      canView: false,
    },
    products: {
      canAdd: false,
      canEdit: false,
      canView: true,
    },
  },
};

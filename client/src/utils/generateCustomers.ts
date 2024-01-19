type CustomerRawStatus =
  | 'Waiting'
  | 'Served'
  | 'No Show'
  | 'MV1'
  | 'MV2'
  | 'MV3'
  | 'MV4'
  | 'DL1'
  | 'DL2';

export interface CustomerRaw {
  id: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
  motorVehicle?: {
    status: CustomerRawStatus;
    callTimes: string[] | [];
  };
  driversLicense?: {
    status: CustomerRawStatus;
    callTimes: string[] | [];
  };
}

// Function to generate a unique ID
const generateUniqueId = (() => {
  let id = 0;
  return () => id++;
})();

// Function to generate a random date within a range of hours
const getRandomDateWithinHoursRange = (
  startHour: number,
  endHour: number
): Date => {
  const currentDate = new Date();
  const randomDate = new Date(currentDate);

  randomDate.setHours(
    startHour + Math.floor(Math.random() * (endHour - startHour))
  );
  randomDate.setMinutes(Math.floor(Math.random() * 60));

  return randomDate;
};

function getRandomStatus(): CustomerRawStatus {
  const randomValue = Math.random() * 100;

  if (randomValue < 60) {
    return 'Waiting';
  } else if (randomValue < 90) {
    return 'Served';
  } else {
    return 'No Show';
  }
}

// Function to generate a random customer fitting the specified type
class CustomerGenerator {
  motorVehicleStationsRemaining: CustomerRawStatus[];
  driversLicenseStationsRemaing: CustomerRawStatus[];

  constructor() {
    // motorVehicle.status cannot be 'MV1' | 'MV2' | 'MV3' | 'MV4' if driversLicense.status is 'DL1'| 'DL2'
    this.motorVehicleStationsRemaining = ['MV1', 'MV2', 'MV3', 'MV4'];
    // driversLicense.status cannot be 'DL1'| 'DL2' if motorVehicle.status is 'MV1' | 'MV2' | 'MV3' | 'MV4'
    this.driversLicenseStationsRemaing = ['DL1', 'DL2'];
  }

  #statusOptions: CustomerRawStatus[] = [
    'Waiting',
    'Served',
    'No Show',
    'MV1',
    'MV2',
    'MV3',
    'MV4',
    'DL1',
    'DL2'
  ];

  getNext(): CustomerRaw {
    const id = generateUniqueId();
    const checkInTime = getRandomDateWithinHoursRange(9, 18); // Restricted to 9 AM to 6 PM

    // Determine whether customer is MV, DL, or both
    const isMotorVehicleCustomer = Math.random() < 0.8; // 80% chance of having 'motorVehicle' status
    let isDriversLicenseCustomer;
    if (isMotorVehicleCustomer) {
      isDriversLicenseCustomer = Math.random() < 0.2; // 20% chance of also being DL customer
    } else {
      isDriversLicenseCustomer = true; // All customers that aren't MV are DL
    }

    // Determine customer's MV status
    const motorVehicleStatus = isMotorVehicleCustomer
      ? this.motorVehicleStationsRemaining.shift() || getRandomStatus()
      : undefined;

    // Determine customer's DL status
    let driversLicenseStatus;
    if (isDriversLicenseCustomer) {
      if (
        isMotorVehicleCustomer &&
        ['MV1', 'MV2', 'MV3', 'MV4'].includes(motorVehicleStatus!)
      ) {
        driversLicenseStatus = getRandomStatus();
      } else {
        driversLicenseStatus =
          this.driversLicenseStationsRemaing.shift() || getRandomStatus();
      }
    }

    const callTimes =
      motorVehicleStatus === 'Waiting' || Math.random() < 0.7 // 70% chance for 'Waiting' status to not have callTimes
        ? []
        : [
            getRandomDateWithinHoursRange(checkInTime.getHours(), 20),
            getRandomDateWithinHoursRange(checkInTime.getHours(), 20)
          ];

    return {
      id,
      motorVehicle: isMotorVehicleCustomer
        ? {
            status: motorVehicleStatus!,
            callTimes: callTimes.map((t) => t.toISOString())
          }
        : undefined,
      driversLicense: isDriversLicenseCustomer
        ? {
            status: driversLicenseStatus!,
            callTimes: callTimes.map((t) => t.toISOString())
          }
        : undefined,
      firstName: `FirstName${id}`,
      lastName: `LastName${id}`,
      checkInTime: checkInTime.toISOString()
    };
  }
}

export default function initCustomers() {
  const c = new CustomerGenerator();

  // Generate an array of 20 random customers
  const customers: CustomerRaw[] = Array.from({ length: 50 }, () =>
    c.getNext()
  );

  // Convert the array to JSON
  const customersJSON = JSON.stringify(customers, null, 2);

  localStorage.setItem('customers', customersJSON);
}

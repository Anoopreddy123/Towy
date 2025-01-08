export enum ServiceType {
    TOWING = "towing",
    GAS_DELIVERY = "gas_delivery",
    MECHANIC = "mechanic",
    BATTERY_JUMP = "battery_jump",
    TIRE_CHANGE = "tire_change",
    LOCKOUT = "lockout"
}

export interface ServiceRequest {
    id: string;
    serviceType: ServiceType;
    location: string;
    vehicleType: string;
    description?: string;
    status: string;
    quotedPrice?: number;
    createdAt: Date;
    updatedAt: Date;
} 
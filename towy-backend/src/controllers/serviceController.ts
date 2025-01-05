import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { ServiceRequest } from '../models/ServiceRequest';
import { User } from '../models/User';

const serviceRepository = AppDataSource.getRepository(ServiceRequest);
const userRepository = AppDataSource.getRepository(User);

export const createServiceRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { location, vehicleType, serviceType, description } = req.body;
        const userId = req.user?.id;

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        const serviceRequest = serviceRepository.create({
            user,
            location,
            vehicleType,
            serviceType,
            description,
            status: 'pending'
        });

        await serviceRepository.save(serviceRequest);
        res.status(201).json({ message: 'Service request created', serviceRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service request' });
    }
};

export const getUserServiceRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const requests = await serviceRepository.find({
            where: { user: { id: userId } },
            relations: ['user']
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

export const updateServiceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const request = await serviceRepository.findOne({ where: { id } });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }

        request.status = status;
        await serviceRepository.save(request);
        res.json({ message: 'Status updated', request });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

export const getServiceRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const request = await serviceRepository.findOne({
            where: { id },
            relations: ['user']
        });

        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching request' });
    }
}; 
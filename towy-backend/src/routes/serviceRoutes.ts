import { Router } from 'express';
import { 
    createServiceRequest, 
    getUserServiceRequests, 
    updateServiceStatus,
    getServiceRequestById 
} from '../controllers/serviceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createServiceRequest);
router.get('/user', authenticateToken, getUserServiceRequests);
router.get('/:id', authenticateToken, getServiceRequestById);
router.patch('/:id/status', authenticateToken, updateServiceStatus);

export const serviceRouter = router; 
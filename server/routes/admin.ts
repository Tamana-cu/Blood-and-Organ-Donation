import { Router, Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../utils/auth';
import { User } from '../models/User';
import { Donor } from '../models/Donor';
import { Request as DonationRequest } from '../models/Request';

const router = Router();

// Approve a donor/recipient user
router.put(
  '/users/:id/approve',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.isApproved = true;
      await user.save();

      res.json({
        message: 'User approved successfully',
        user,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error approving user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all unapproved users
router.get(
  '/users/pending/all',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find({ isApproved: false });
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all users
router.get(
  '/users/all',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Delete user (remove fake accounts)
router.delete(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Delete related donor profile if exists
      await Donor.deleteMany({ userId: req.params.id });

      // Delete related requests if exists
      await DonationRequest.deleteMany({ userId: req.params.id });

      await User.deleteOne({ _id: req.params.id });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get dashboard statistics
router.get(
  '/dashboard/stats',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDonors = await Donor.countDocuments();
      const totalRequests = await DonationRequest.countDocuments();
      const pendingApprovals = await User.countDocuments({ isApproved: false });
      const matchedRequests = await DonationRequest.countDocuments({
        status: 'matched',
      });
      const completedRequests = await DonationRequest.countDocuments({
        status: 'completed',
      });

      const bloodGroupStats = await Donor.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        totalUsers,
        totalDonors,
        totalRequests,
        pendingApprovals,
        matchedRequests,
        completedRequests,
        bloodGroupStats,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all donors (admin view)
router.get(
  '/donors/all',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const donors = await Donor.find().populate(
        'userId',
        'name email phone location'
      );
      res.json(donors);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching donors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all requests (admin view)
router.get(
  '/requests/all',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await DonationRequest.find()
        .populate('userId', 'name email phone location')
        .populate('matchedDonors', 'name email phone');
      res.json(requests);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching requests',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;

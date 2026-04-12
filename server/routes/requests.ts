import { Router, Request, Response } from 'express';
import { Request as DonationRequest } from '../models/Request';
import { Donor } from '../models/Donor';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { authMiddleware } from '../utils/auth';

const router = Router();

// Create a request
router.post(
  '/',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const { type, bloodGroup, organType, urgency, location, reason } = req.body;

      if (!type || !urgency || !location) {
        res.status(400).json({
          message: 'Type, urgency, and location are required',
        });
        return;
      }

      if (type === 'blood' && !bloodGroup) {
        res.status(400).json({ message: 'Blood group is required for blood requests' });
        return;
      }

      if (type === 'organ' && !organType) {
        res.status(400).json({ message: 'Organ type is required for organ requests' });
        return;
      }

      const request = new DonationRequest({
        userId: req.user._id,
        type,
        bloodGroup,
        organType,
        urgency,
        location,
        reason,
        status: 'pending',
      });

      await request.save();

      // Find matching donors
      let matchedDonors = [];
      if (type === 'blood') {
        matchedDonors = await Donor.find({
          bloodGroup,
          isAvailable: true,
        }).select('userId');
      } else {
        matchedDonors = await Donor.find({
          organs: organType,
          isAvailable: true,
        }).select('userId');
      }

      request.matchedDonors = matchedDonors.map((d) => d.userId);
      if (matchedDonors.length > 0) {
        request.status = 'matched';

        // Notify matching donors
        const notificationPromises = matchedDonors.map((donor) => {
          return new Notification({
            userId: donor.userId,
            title: `Urgent ${type === 'blood' ? 'Blood' : 'Organ'} Request`,
            message: `A new ${urgency} urgency request for ${
              type === 'blood' ? bloodGroup : organType
            } has been posted in ${location}.`,
            type: urgency === 'high' ? 'error' : 'info',
            link: `/donor/dashboard`,
          }).save();
        });
        await Promise.all(notificationPromises);
      }

      await request.save();

      res.status(201).json({
        message: 'Request created successfully',
        request,
        matchedDonorCount: matchedDonors.length,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all requests
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await DonationRequest.find()
      .populate('userId', 'name email phone location')
      .populate('matchedDonors', 'name email phone location');
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get request by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('userId', 'name email phone location')
      .populate('matchedDonors', 'name email phone location');
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user's requests
router.get(
  '/user/my-requests',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const requests = await DonationRequest.find({ userId: req.user._id })
        .populate('matchedDonors', 'name email phone location');
      res.json(requests);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching requests',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get matching donors for a request
router.get(
  '/:id/matches',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await DonationRequest.findById(req.params.id).populate(
        'matchedDonors',
        'name email phone location role'
      );
      if (!request) {
        res.status(404).json({ message: 'Request not found' });
        return;
      }
      res.json({
        request,
        matches: request.matchedDonors,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching matches',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Update request status
router.put(
  '/:id/status',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const { status } = req.body;

      if (!['pending', 'matched', 'completed', 'cancelled'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      const request = await DonationRequest.findById(req.params.id);
      if (!request) {
        res.status(404).json({ message: 'Request not found' });
        return;
      }

      // Only requester or admin can update status
      if (
        req.user._id.toString() !== request.userId.toString() &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      request.status = status;
      await request.save();

      res.json({
        message: 'Request status updated',
        request,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Update request details
router.put(
  '/:id',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const { type, bloodGroup, organType, urgency, location, reason } = req.body;
      const request = await DonationRequest.findById(req.params.id);

      if (!request) {
        res.status(404).json({ message: 'Request not found' });
        return;
      }

      // Only requester or admin can update
      if (
        req.user._id.toString() !== request.userId.toString() &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      if (type) request.type = type;
      if (bloodGroup) request.bloodGroup = bloodGroup;
      if (organType) request.organType = organType;
      if (urgency) request.urgency = urgency;
      if (location) request.location = location;
      if (reason) request.reason = reason;

      // Re-trigger matching if critical fields changed
      if (type || bloodGroup || organType) {
        let matchedDonors = [];
        if (request.type === 'blood') {
          matchedDonors = await Donor.find({
            bloodGroup: request.bloodGroup,
            isAvailable: true,
          }).select('userId');
        } else {
          matchedDonors = await Donor.find({
            organs: request.organType,
            isAvailable: true,
          }).select('userId');
        }
        request.matchedDonors = matchedDonors.map(d => d.userId);
        if (matchedDonors.length > 0) {
          request.status = 'matched';
        }
      }

      await request.save();

      res.json({
        message: 'Request updated successfully',
        request,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Delete request
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const request = await DonationRequest.findById(req.params.id);
      if (!request) {
        res.status(404).json({ message: 'Request not found' });
        return;
      }

      // Only requester or admin can delete
      if (
        req.user._id.toString() !== request.userId.toString() &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      await DonationRequest.deleteOne({ _id: req.params.id });

      res.json({ message: 'Request deleted successfully' });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import { Donor } from '../models/Donor';
import { User } from '../models/User';
import { Request as DonationRequest } from '../models/Request';
import { authMiddleware } from '../utils/auth';

const router = Router();

// Register as donor
router.post(
  '/register',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const { bloodGroup, organs, location, notes } = req.body;

      if (!bloodGroup || !location) {
        res.status(400).json({ message: 'Blood group and location are required' });
        return;
      }

      const existingDonor = await Donor.findOne({ userId: req.user._id });
      if (existingDonor) {
        res.status(400).json({ message: 'You are already registered as a donor' });
        return;
      }

      const donor = new Donor({
        userId: req.user._id,
        bloodGroup,
        organs: organs || [],
        location,
        notes,
        isAvailable: true,
      });

      await donor.save();

      res.status(201).json({
        message: 'Donor profile created successfully',
        donor,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating donor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get all donors
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const donors = await Donor.find().populate('userId', 'name email phone location');
    res.json(donors);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching donors',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user's donor profile
router.get(
  '/profile/me',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const donor = await Donor.findOne({ userId: req.user._id }).populate(
        'userId',
        'name email phone location'
      );
      if (!donor) {
        res.status(404).json({ message: 'No donor profile found' });
        return;
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching donor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get matching requests for a donor
router.get(
  '/profile/matches',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const donor = await Donor.findOne({ userId: req.user._id });
      if (!donor) {
        res.status(404).json({ message: 'No donor profile found' });
        return;
      }

      const requests = await DonationRequest.find({
        $or: [
          { type: 'blood', bloodGroup: donor.bloodGroup },
          { type: 'organ', organType: { $in: donor.organs } },
        ],
        status: { $in: ['pending', 'matched'] },
      }).populate('userId', 'name email phone location');

      res.json(requests);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching matching requests',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Update donor profile
router.put(
  '/:id',
  authMiddleware,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const { bloodGroup, organs, location, isAvailable, notes } = req.body;

      const donor = await Donor.findById(req.params.id);
      if (!donor) {
        res.status(404).json({ message: 'Donor not found' });
        return;
      }

      if (donor.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      if (bloodGroup) donor.bloodGroup = bloodGroup;
      if (organs) donor.organs = organs;
      if (location) donor.location = location;
      if (isAvailable !== undefined) donor.isAvailable = isAvailable;
      if (notes) donor.notes = notes;

      await donor.save();

      res.json({
        message: 'Donor profile updated successfully',
        donor,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating donor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get donor by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const donor = await Donor.findById(req.params.id).populate(
      'userId',
      'name email phone location'
    );
    if (!donor) {
      res.status(404).json({ message: 'Donor not found' });
      return;
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching donor',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

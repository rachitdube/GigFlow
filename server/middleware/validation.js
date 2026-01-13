import { body, validationResult } from "express-validator";

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validation rules
export const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").exists().withMessage("Password is required"),
];

// Gig validation rules
export const validateGigCreation = [
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),
  body("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("budget")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Budget must be a positive number"),
];

export const validateGigUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("budget")
    .optional()
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Budget must be a positive number"),
];

// Bid validation rules
export const validateBidSubmission = [
  body("gigId").isMongoId().withMessage("Invalid gig ID"),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
  body("price")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Price must be a positive number"),
];

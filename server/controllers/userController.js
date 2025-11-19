// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    logger.info(`Attempting to authenticate user with email: ${email}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if we have a database connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database not connected');
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    logger.info(`Finding user with email: ${email}`);
    const user = await User.findOne({ email });
    logger.info(`User lookup result: ${user ? 'User found' : 'User not found'}`);

    if (user) {
      logger.info(`User found, attempting password comparison`);
      try {
        const isPasswordMatch = await user.matchPassword(password);
        logger.info(`Password match result: ${isPasswordMatch}`);
        
        if (isPasswordMatch) {
          logger.info(`Successfully authenticated user with email: ${email}`);
          const token = generateToken(user._id);
          logger.info(`Token generated for user: ${user.email}`);
          
          const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token
          };
          
          logger.info(`Sending response: ${JSON.stringify(responseData)}`);
          
          // Ensure proper headers for CORS (normalize origin)
          const origin = req.headers.origin;
          const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '*';
          res.header('Access-Control-Allow-Origin', normalizedOrigin);
          res.header('Access-Control-Allow-Credentials', 'true');
          
          return res.json(responseData);
        } else {
          logger.warn(`Authentication failed - password mismatch for email: ${email}`);
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } catch (passwordError) {
        logger.error(`Error during password comparison for email: ${email}`, {
          message: passwordError.message,
          stack: passwordError.stack
        });
        return res.status(500).json({ message: 'Error during authentication' });
      }
    } else {
      logger.warn(`Authentication failed - user not found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Authentication error for email: ${req.body.email || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    
    // Return a more detailed error response in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error during authentication',
        error: error.message,
        stack: error.stack
      });
    }
    
    // Return a generic error in production
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
});
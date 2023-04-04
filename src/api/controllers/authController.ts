import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';

// TODO: Create login controller that creates a jwt token and returns it to the user
const login = async (
  req: Request<{}, {}, {username: string; password: string}>,
  res: Response,
  next: NextFunction
) => {
  const {username, password} = req.body;
  try {
    const user = await userModel.findOne({email: username});
    if (!user) {
      next(new CustomError('User not found', 200));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      next(new CustomError('Password is incorrect', 200));
      return;
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET as string);

    const message: LoginMessageResponse = {
      message: 'Login successful',
      token,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError('Duplicate entry'.message, 500));
  }
};

export {login};

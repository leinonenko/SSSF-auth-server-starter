// TODO: Create login controller that creates a jwt token and returns it to the user
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {NextFunction, Request, Response} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {OutputUser} from '../../interfaces/User';

const login = async (
  req: Request<{}, {}, {username: string; password: string}>,
  res: Response,
  next: NextFunction
) => {
  const {username, password} = req.body;
  try {
    const user = await userModel.findOne({email: username});
    if (!user) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      next(new CustomError('Incorrect username/password', 200));
      return;
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET as string);

    const outputUser: OutputUser = {
      id: user._id,
      email: user.email,
      user_name: user.user_name,
    };
    const message: LoginMessageResponse = {
      message: 'Login successful',
      token,
      user: outputUser,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {login};

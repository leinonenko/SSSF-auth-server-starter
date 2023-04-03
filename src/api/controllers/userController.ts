// Description: This file contains the functions for the user routes
// TODO: add function to get all users
// TODO: add function to get a user by id
// TODO: add function to create a user
// TODO: add function to update a user
// TODO: add function to delete a user
// TODO: add function to check if a token is valid

import {Request, Response} from 'express';
import {NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {User} from '../../interfaces/User';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import DBMessageResponse from '../../interfaces/DBMessageResponse';

const check = (req: Request, res: Response) => {
  res.json({message: 'Server is alive'});
};

const salt = bcrypt.genSaltSync(10);

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role');
    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
    }
    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = await userModel.create(user);

    const response: DBMessageResponse = {
      message: 'User created',
      user: {
        user_name: newUser.user_name,
        email: newUser.email,
        id: newUser._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

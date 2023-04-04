// Description: This file contains the functions for the user routes
// TODO: add function to get all users
// TODO: add function to get a user by id
// TODO: add function to create a user
// TODO: add function to update a user
// TODO: add function to delete a user
// TODO: add function to check if a token is valid
import jwt from 'jsonwebtoken';
import {Request, Response} from 'express';
import {NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {OutputUser, User} from '../../interfaces/User';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';

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
    next(new CustomError('Duplicate entry', 200));
  }
};

const userPut = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;

    const user = req.body;
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    const result = await userModel
      .findByIdAndUpdate(userFromToken.id, user, {
        new: true,
      })
      .select('-password -role');

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'User updated',
      user: {
        user_name: result!.user_name,
        email: result.email,
        id: result._id,
      },
    };
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDelete = async (
  req: Request,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;

    const result = await userModel.findByIdAndDelete(userFromToken.id);
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }
    const response: DBMessageResponse = {
      message: 'user deleted',
      user: {
        user_name: result.user_name,
        email: result.email,
        id: result._id,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const checkToken = async (
  req: Request,
  res: Response<{}, {user: OutputUser}>,
  next: NextFunction
) => {
  const userFromToken = res.locals.user;

  const message: DBMessageResponse = {
    message: 'Token is valid',
    user: userFromToken,
  };
  res.json({message: 'Token is valid'});
};

export {check, userListGet, userGet, userPost, userPut, userDelete, checkToken};

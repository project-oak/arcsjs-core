import {auth} from './auth.js';

export const FissionPromise = new Promise(resolve => auth(resolve));
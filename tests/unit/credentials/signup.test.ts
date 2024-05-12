import { expect } from '@jest/globals';
import { signup } from '@/lib/credentials/signup';

/** @type {Registration} */
let payload;

/** @type {SubmissionStatus} */
let response;

test('Test empty required user registration fields', async () => {
  // All empty fields expect for birthday
  payload = {
    name: '',
    birthday: new Date(),
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Error');
  expect(response.response.message).toEqual(
    'Invalid user registration fields.',
  );

  // Ensure the empty fields are caught as errors
  expect(response.errors).toMatchObject({
    username: ['A username must be at least 3 characters'],
    password: [
      'A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)',
    ],
    name: ['A name must be at least 2 characters'],
    email: ['A valid email is required'],
    phone: ['A valid phone is required if provided'],
  });
});

test('Test missing or bad user registration fields', async () => {
  // No birthday or email provided
  payload = {
    name: 'John Doe',
    username: 'johndoe123',
    password: 'password$AAd123',
    confirmPassword: 'password$AAd3',
    phone: '1234567890',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Error');
  expect(response.response.message).toEqual(
    'Invalid user registration fields.',
  );

  // Ensure the missing fields are caught as errors
  expect(response.errors).toMatchObject({
    birthday: ['Required'],
    email: ['Required'],
  });

  // Username too long, name too short, birthday too old, phone number too long, but a valid main password
  payload = {
    name: 'r',
    birthday: new Date('1600-01-01'),
    username: 'John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe',
    password: 'Password$AAd123',
    confirmPassword: 'Password$AAd32',
    phone: '12345629313243443243290',
  };

  response = await signup(payload, true);
  
  expect(response.state).toEqual('Error');
  expect(response.response.message).toEqual(
    'Invalid user registration fields.',
  );

  expect(response.errors).toMatchObject({
    username: ['A username must be at most 30 characters'],
    name: ['A name must be at least 2 characters'],
    email: ['Required'],
    phone: ['A valid phone is required if provided'],
  });

  // Almost perfect user registration fields, but passwords do not match
  payload = {
    name: 'John Doe',
    birthday: new Date('1990-01-01'),
    username: 'johndoe123',
    password: '0Password123$$A2A',
    confirmPassword: '0Password123$$AA',
    email: 'john.doe@example.com',
    phone: '1234567890',
  };

  response = await signup(payload, true);
  
  expect(response.state).toEqual('Error');
  expect(response.response.message).toEqual(
    'Invalid user registration fields.',
  );

  expect(response.errors).toMatchObject({
    password: ['Passwords do not match'],
    confirmPassword: ['Passwords do not match'],
  });
});

test('Test valid registration fields', async () => {
  payload = {
    name: 'John Doe',
    birthday: new Date('1990-01-01'),
    username: 'johndoe123',
    password: '0Password123$$AA',
    confirmPassword: '0Password123$$AA',
    email: 'john.doe@example.com',
    phone: '1234567890',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Success');
  expect(response.response.message).toEqual(
    'Successfully processed user registration for testing purposes.',
  );

  // Ensure various phone numbers and dates can be added
  payload = {
    name: 'Smith Row',
    birthday: new Date('2004-01-01'),
    username: 'smithRow001',
    password: 'sm&AA1293s$$AA01',
    confirmPassword: 'sm&AA1293s$$AA01',
    email: 'smith.row@example.com',
    phone: '2124567890',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Success');
  expect(response.response.message).toEqual(
    'Successfully processed user registration for testing purposes.',
  );

  payload = {
    name: 'Eric Smit',
    birthday: new Date('2014-12-01'),
    username: 'eric192',
    password: 'sm&AA1293s$$AA01',
    confirmPassword: 'sm&AA1293s$$AA01',
    email: 'smith.row@example.com',
    phone: '+1-212-456-7890',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Success');
  expect(response.response.message).toEqual(
    'Successfully processed user registration for testing purposes.',
  );


  payload = {
    name: 'John Smith',
    birthday: new Date('2008-01-01'),
    username: 'smith12',
    password: 'sm&AA1293s$$AA01',
    confirmPassword: 'sm&AA1293s$$AA01',
    email: 'john.smith@gmail.com',
    phone: '+1-888-555-1234',
  };

  response = await signup(payload, true);

  expect(response.state).toEqual('Success');
  expect(response.response.message).toEqual(
    'Successfully processed user registration for testing purposes.',
  );
});

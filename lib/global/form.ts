import { produce } from "immer";
import { Dispatch } from "react";

export interface InputState {
  id: string;
  value: any;
  error: any | null;
  type?: string;
}

export type InputStates = { [key: string]: InputState };
export type FormPayload = { [key: string]: string };
export interface FormResponse {
  state: "Success" | "Error" | "Failure";
  response: { message: string; data: any; errors: { [key: string]: string } };
}

export interface FormAction {
  type:
    | "updateInput"
    | "updateStatus"
    | "constructPayload"
    | "updatePayload"
    | "resetForm";
  value: InputState | FormResponse | FormPayload | null;
}

export interface FormState {
  status: "Initial" | "Success" | "Error" | "Failure";
  inputs: InputStates;
  response: FormResponse | null;
  payload: FormPayload | null;
}

export interface InputProps extends React.InputHTMLAttributes<any> {
  label: string;
  input: InputState;
  dispatch: Dispatch<FormAction>;
}

export const initialFormState: FormState = {
  status: "Initial",
  inputs: {},
  response: null,
  payload: null,
};

export function formReducer(state: FormState, action: FormAction): FormState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "updateInput":
        const input = action.value as InputState;
        draft.inputs[input.id] = input;

        break;
      case "updateStatus":
        const response = action.value as FormResponse;
        draft.response = response;

        for (const key in state.inputs) {
          draft.inputs[key].error = response.response.errors[key] ?? null;
        }

        break;
      case "resetForm":
        for (const key in state.inputs) {
          draft.inputs[key] = {
            ...state.inputs[key],
            value: "",
            error: null,
          };
        }

        break;
      case "constructPayload":
        const payload: FormPayload = {};

        for (const key in state.inputs) {
          payload[key] = state.inputs[key].value;
        }

        draft.payload = payload;

        break;
      case "updatePayload":
        draft.payload = action.value as FormPayload;

        break;
      default:
        return state;
    }
  });
}

export function sendSuccessMessage(message: string, data?: any): FormResponse {
  return {
    state: "Success",
    response: { message: message, data: data, errors: {} },
  };
}

export function sendErrorMessage(
  status: "Error" | "Failure",
  message: string,
  errors: { [key: string]: string }
): FormResponse {
  return {
    state: status,
    response: {
      message: message,
      data: null,
      errors: errors ?? {},
    },
  };
}

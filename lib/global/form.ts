import { produce } from "immer";

export interface InputState {
  id: string;
  value: any;
  defaultValue: any;
  error: any | null;
  type: string | null;
  data: { [key: string]: any };
}

export type InputStates = { [key: string]: InputState };
export type FormPayload = { [key: string]: string | Date };
export interface FormResponse {
  status: "Success" | "Error" | "Failure";
  body: {
    message: string;
    data: any;
    errors: { [key: string]: string[] | undefined };
  };
}

export interface ResetInputState {
  [key: string]: any;
}

export interface FormAction {
  type: "initializeInputs"| "updateInput" | "updateStatus" | "updateFormState" | "resetForm";
  value:
    | InputStates
    | InputState
    | FormResponse
    | FormState
    | FormPayload
    | ResetInputState
    | null;
}

export interface FormState {
  status: "Initial" | "Success" | "Error" | "Failure";
  inputs: InputStates;
  response: FormResponse | null;
}

export function constructPayload(inputs: {
  [key: string]: InputState;
}): FormPayload {
  const payload: FormPayload = {};

  for (const key in inputs) {
    payload[key] = inputs[key].value;
  }

  return payload;
}

export function formReducer(state: FormState, action: FormAction): FormState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "initializeInputs":
        const inputStates = action.value as InputStates;

        for (const key of Object.keys(inputStates)) {
          draft.inputs[key] = inputStates[key];
        }

        break;
      case "updateInput":
        const input = action.value as InputState;
        draft.inputs[input.id] = input; 

        break;
      case "updateStatus":
        const response = action.value as FormResponse;

        if (response) {
          draft.status = response.status;
          draft.response = response;

          for (const key in state.inputs) {
            draft.inputs[key].error = response?.body.errors[key] ?? null;
          }
        }

        break;
      case "updateFormState":
        // Manually update properties of draft (complex state)
        Object.assign(draft, action.value as FormState);
        break;
      case "resetForm":
        const reset = action.value as ResetInputState;

        for (const key in state.inputs) {
          draft.inputs[key] = {
            ...state.inputs[key],
            value: state.inputs[key].defaultValue,
            error: null,
            data: reset[key] ?? state.inputs[key].data,
          };
        }

        break;
      default:
        return state;
    }
  });
}

export function sendSuccessMessage(message: string, data?: any): FormResponse {
  return {
    status: "Success",
    body: { message: message, data: data, errors: {} },
  };
}

export function sendErrorMessage(
  status: "Error" | "Failure",
  message: string,
  errors: { [key: string]: string[] }
): FormResponse {
  return {
    status: status,
    body: {
      message: message,
      data: null,
      errors: errors ?? {},
    },
  };
}

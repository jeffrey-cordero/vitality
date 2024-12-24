/** @jest-environment jsdom */
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCallback, useEffect, useReducer } from "react";

import { Input } from "@/components/global/input";
import Select from "@/components/global/select";
import TextArea from "@/components/global/textarea";
import { sendErrorMessage } from "@/lib/global/response";
import { formReducer, VitalityState } from "@/lib/global/reducer";

let globalState: VitalityState;

// Initial state
const initialState: VitalityState = {
   name: { value: "", error: null, data: { valid: undefined } },
   password: { value: "", error: null, data: {} },
   text: { value: "", error: null, data: {} },
   options: { value: "", error: null, data: {} },
   email: { value: "", error: null, data: {} },
   tags: { value: [], error: null, data: {}, handlesOnChange: true }
};

function Component(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, initialState);

   // Mock dispatch callback methods
   const handleUpdateTags = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...state.tags,
               value: [...state.tags.value, "Extend"]
            }
         }
      });
   }, [state.tags]);

   const handleInitializeState = useCallback(() => {
      dispatch({
         type: "initializeState",
         value: {
            name: {
               ...state.name,
               value: "initializeName"
            },
            password: {
               ...state.password,
               value: "initializePassword"
            },
            text: {
               ...state.text,
               value: "initializeText"
            },
            options: {
               ...state.options,
               value: "1"
            },
            email: {
               ...state.email,
               value: "initialize@gmail.com"
            },
            tags: {
               ...state.tags,
               value: ["One", "Two", "Three"]
            }
         }
      });
   }, [
      state.email,
      state.name,
      state.options,
      state.password,
      state.tags,
      state.text
   ]);

   const handleResetState = useCallback(() => {
      dispatch({
         type: "resetState",
         value: {
            name: {
               value: "resetName",
               data: {
                  valid: false,
                  reset: true
               }
            },
            text: {
               value: "resetText",
               data: {
                  reset: true
               }
            },
            tags: {
               value: ["Four", "Five", "Six"],
               data: {
                  reset: true
               }
            }
         }
      });
   }, []);

   const handleUpdateStates = useCallback(() => {
      dispatch({
         type: "updateStates",
         value: {
            name: {
               ...state.name,
               value: "updateName",
               data: {
                  valid: true
               },
               handlesOnChange: true
            },
            email: {
               ...state.email,
               value: "update@gmail.com"
            },
            text: {
               ...state.text,
               value: "updateText",
               handlesOnChange: true
            },
            options: {
               ...state.options,
               value: "2",
               handlesOnChange: true
            }
         }
      });
   }, [
      state.email,
      state.name,
      state.options,
      state.text
   ]);

   const handleUpdateErrors = useCallback(() => {
      dispatch({
         type: "updateErrors",
         value: sendErrorMessage("Errors", {
            name: ["Name must be at least 2 characters"],
            password: ["Password must be non-empty"]
         })
      });
   }, []);

   const handleUpdateHandlesChanges = useCallback(() => {
      dispatch({
         type: "updateStates",
         value: {
            name: {
               ...state.name,
               handlesOnChange: true
            },
            text: {
               ...state.text,
               handlesOnChange: true
            },
            options: {
               ...state.options,
               handlesOnChange: true
            }

         }
      });
   }, [
      state.name,
      state.options,
      state.text
   ]);

   useEffect(() => {
      globalState = state;
   }, [state]);

   return (
      <div className = "modal">
         <Input
            id = "name"
            type = "text"
            label = "Name"
            input = { state.name }
            dispatch = { dispatch }
            autoFocus
            scrollIntoView
            required
         >
            { state.name.value }
         </Input>
         <Input
            id = "password"
            type = "password"
            label = "Password"
            input = { state.password }
            dispatch = { dispatch }
         >
            { state.name.value }
         </Input>
         <Input
            id = "email"
            type = "email"
            label = "Email"
            input = { state.email }
            dispatch = { dispatch }
         >
            { state.email.value }
         </Input>
         <TextArea
            id = "text"
            type = "text"
            label = "Text"
            input = { state.text }
            dispatch = { dispatch }
            autoFocus
         />
         <Select
            id = "options"
            type = "text"
            values = { ["", "1", "2", "3"] }
            label = "Options"
            input = { state.options }
            dispatch = { dispatch }
            autoFocus
         />
         <div
            id = "tags"
            onClick = { handleUpdateTags }
         >
            { state.tags.value.toString() }
         </div>
         <button
            id = "initialize"
            onClick = { handleInitializeState }
         >
            Initialize State
         </button>
         <button
            id = "updates"
            onClick = { handleUpdateStates }
         >
            Update States
         </button>
         <button
            id = "reset"
            onClick = { handleResetState }
         >
            Reset State
         </button>
         <button
            id = "errors"
            onClick = { handleUpdateErrors }
         >
            Update Errors
         </button>
         <button
            id = "handles"
            onClick = { handleUpdateHandlesChanges }
         >
            Handle Changes
         </button>
      </div>
   );
}

describe("State Reducer Tests", () => {
   // Mock scrollIntoView method for DOM elements
   Element.prototype.scrollIntoView = jest.fn();

   const validateStateChanges = (dom: any, state: VitalityState) => {
      // Validate DOM state-related elements
      expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe(state.name.value);
      expect((dom.container.querySelector("#password") as HTMLInputElement).value).toBe(state.password.value);
      expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe(state.email.value);
      expect((dom.container.querySelector("#text") as HTMLTextAreaElement).value).toBe(state.text.value);
      expect((dom.container.querySelector("#options") as HTMLSelectElement).value).toBe(state.options.value);
      expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe(state.tags.value.toString());

      // Validate global state
      expect(globalState).toEqual(state);
   };

   describe("Initialize state", () => {
      test("Initialize state with dispatch method", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.click(dom.container.querySelector("#initialize"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: { value: "initializeName", error: null, data: { valid: undefined } },
               password: { value: "initializePassword", error: null, data: {} },
               text: { value: "initializeText", error: null, data: {} },
               options: { value: "1", error: null, data: {} },
               email: { value: "initialize@gmail.com", error: null, data: {} },
               tags: {
                  value: [ "One", "Two", "Three" ],
                  error: null,
                  data: {},
                  handlesOnChange: true
               }
            });
         });
      });
   });

   describe("Update state", () => {
      test("Update input with dispatch", async() => {
         const dom = render(<Component />);

         // Validate password input type management through icon element
         const passwordIcon = dom.container.querySelectorAll(".password-icon")[0];

         expect(passwordIcon).not.toBeNull();
         expect(globalState.password.data).toEqual({});
         expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "password");

         await act(async() => {
            await userEvent.click(passwordIcon);
         });

         await waitFor(() => {
            expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "text");
            expect(globalState.password.data).toEqual({ type: "text" });
         });

         await act(async() => {
            await userEvent.click(passwordIcon);
            await userEvent.type(dom.container.querySelector("#name"), "user");
            await userEvent.keyboard("{Escape}");
            await userEvent.type(dom.container.querySelector("#password"), "password");
            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{Enter}");
            await userEvent.type(dom.container.querySelector("#email"), "user@gmail.com");
            await userEvent.keyboard("{Enter}");
            await userEvent.type(dom.container.querySelector("#text"), "Hello\nWorld");
            await userEvent.keyboard("{Escape}");
            await userEvent.selectOptions(dom.container.querySelector("#options"), "3");
            await userEvent.click(dom.container.querySelector("#tags"));
         });

         await waitFor(() => {
            expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "text");

            validateStateChanges(dom, {
               "name": { value: "user", error: null, data: {} },
               "password": { value: "password", error: null, data: { type: "text" } },
               "text": { value: "Hello\nWorld", error: null, data: {} },
               "options": { value: "3", error: null, data: {} },
               "email": { value: "user@gmail.com", error: null, data: {} },
               "tags": { value: ["Extend"], error: null, data: {}, handlesOnChange: true }
            });
         });
      });

      test("Update multiple inputs with dispatch", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.click(dom.container.querySelector("#updates"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: { value: "updateName", error: null, data: { valid: true }, handlesOnChange: true },
               password: { value: "", error: null, data: {} },
               text: { value: "updateText", error: null, data: {}, handlesOnChange: true },
               options: { value: "2", error: null, data: {}, handlesOnChange: true },
               email: { value: "update@gmail.com", error: null, data: {} },
               tags: { value: [], error: null, data: {}, handlesOnChange: true }
            });
         });
      });

      test("Update multiple input errors with dispatch", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.click(dom.container.querySelector("#errors"));
         });

         await waitFor(() => {
            // Validate error elements displaying in the DOM with respective messages
            const errors = dom.container.querySelectorAll(".input-error");

            expect(errors).toHaveLength(2);
            expect(errors[0].textContent.trim()).toEqual("Name must be at least 2 characters");
            expect(errors[1].textContent.trim()).toEqual("Password must be non-empty");

            validateStateChanges(dom, {
               name: {
                  value: "",
                  error: "Name must be at least 2 characters",
                  data: { valid: undefined }
               },
               password: {
                  value: "",
                  error: "Password must be non-empty",
                  data: {}
               },
               text: { value: "", error: null, data: {} },
               options: { value: "", error: null, data: {} },
               email: { value: "", error: null, data: {} },
               tags: { value: [], error: null, data: {}, handlesOnChange: true }
            });
         });
      });

      test("Validate no changes for inputs with handlesOnChange defined", async() => {
         const dom = render(<Component />);

         // Apply handlesOnChange to name, text, and options inputs
         await act(async() => {
            await userEvent.click(dom.container.querySelector("#handles"));
         });

         await act(async() => {
            await userEvent.type(dom.container.querySelector("#name"), "Handles onChange?");
            await userEvent.type(dom.container.querySelector("#text"), "Handles onChange?");
            await userEvent.selectOptions(dom.container.querySelector("#options"), "3");
         });

         // Validate no changes for name, text, and options inputs
         await waitFor(() => {
            validateStateChanges(dom, {
               name: { value: "", error: null, data: { valid: undefined }, handlesOnChange: true },
               password: { value: "", error: null, data: {} },
               text: { value: "", error: null, data: {}, handlesOnChange: true },
               options: { value: "", error: null, data: {}, handlesOnChange: true },
               email: { value: "", error: null, data: {} },
               tags: { value: [], error: null, data: {}, handlesOnChange: true }
            });
         });
      });
   });

   describe("Reset state", () => {
      test("Reset multiple inputs with dispatch", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.type(dom.container.querySelector("#name"), "newName");
            await userEvent.type(dom.container.querySelector("#password"), "newPassword");
            await userEvent.click(dom.container.querySelector("#reset"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: { value: "resetName", error: null, data: { valid: false, reset: true } },
               password: { value: "", error: null, data: {} },
               text: { value: "resetText", error: null, data: { reset: true } },
               options: { value: "", error: null, data: {} },
               email: { value: "", error: null, data: {} },
               tags: {
                  value: ["Four", "Five", "Six"],
                  error: null,
                  data: { reset: true },
                  handlesOnChange: true
               }
            });
         });
      });
   });
});
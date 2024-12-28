/** @jest-environment jsdom */
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCallback, useEffect, useReducer } from "react";

import { Input } from "@/components/global/input";
import Select from "@/components/global/select";
import TextArea from "@/components/global/textarea";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { sendErrorMessage } from "@/lib/global/response";

let globalState: VitalityState;

const form: VitalityState = {
   name: {
      id: "name",
      value: "",
      error: null,
      data: {
         valid: undefined
      }
   },
   password: {
      id: "password",
      value: "",
      error: null
   },
   text: {
      id:"text",
      value: "",
      error: null
   },
   options: {
      id: "options",
      value: "1",
      error: null
   },
   email: {
      id: "email",
      value: "",
      error: null
   },
   tags: {
      id: "tags",
      value: [],
      error: null,
      handlesChanges: true
   }
};

function Component(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   // Mock dispatch methods
   const initializeState = useCallback(() => {
      dispatch({
         type: "updateStates",
         value: {
            name: {
               value: "initializeName"
            },
            password: {
               value: "initializePassword"
            },
            text: {
               value: "initializeText"
            },
            options: {
               value: "1"
            },
            email: {
               value: "initialize@gmail.com"
            },
            tags: {
               value: ["Initialize"]
            }
         }
      });
   }, []);

   const resetState = useCallback(() => {
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
               value: "resetText"
            },
            tags: {
               value: ["Reset"]
            }
         }
      });
   }, []);

   const updateStates = useCallback(() => {
      dispatch({
         type: "updateStates",
         value: {
            name: {
               value: "updateName",
               data: {
                  valid: true
               },
               handlesChanges: true
            },
            email: {
               value: "update@gmail.com"
            },
            text: {
               value: "updateText",
               handlesChanges: true
            },
            options: {
               value: "2",
               handlesChanges: true
            }
         }
      });
   }, []);

   const updateTags = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "tags",
            value: { value: [...state.tags.value, "Update"] }
         }
      });
   }, [state.tags]);

   const displayErrors = useCallback(() => {
      dispatch({
         type: "processResponse",
         value: sendErrorMessage("Mock errors caught at runtime", {
            name: ["Name must be at least 2 characters"],
            password: ["Password must be non-empty"]
         })
      });
   }, []);

   const updateHandlesChanges = useCallback(() => {
      dispatch({
         type: "updateStates",
         value: {
            name: {
               handlesChanges: true
            },
            text: {
               handlesChanges: true
            },
            options: {
               handlesChanges: true
            }
         }
      });
   }, []);

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
            values = { ["1", "2", "3"] }
            label = "Options"
            input = { state.options }
            dispatch = { dispatch }
            autoFocus
         />
         <div
            id = "tags"
            onClick = { updateTags }
         >
            { state.tags.value.toString() }
         </div>
         <button
            id = "initialize"
            onClick = { initializeState }
         >
            Initialize State
         </button>
         <button
            id = "updates"
            onClick = { updateStates }
         >
            Update States
         </button>
         <button
            id = "reset"
            onClick = { resetState }
         >
            Reset State
         </button>
         <button
            id = "errors"
            onClick = { displayErrors }
         >
            Update Errors
         </button>
         <button
            id = "handles"
            onClick = { updateHandlesChanges }
         >
            Handle Changes
         </button>
      </div>
   );
}

describe("Reducer Tests", () => {
   // Mock scrollIntoView method for DOM elements
   Element.prototype.scrollIntoView = jest.fn();

   const validateStateChanges = (dom: any, state: VitalityState) => {
      // Validate state-related elements in the DOM
      expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe(state.name.value);
      expect((dom.container.querySelector("#password") as HTMLInputElement).value).toBe(state.password.value);
      expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe(state.email.value);
      expect((dom.container.querySelector("#text") as HTMLTextAreaElement).value).toBe(state.text.value);
      expect((dom.container.querySelector("#options") as HTMLSelectElement).value).toBe(state.options.value);
      expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe(state.tags.value.toString());

      // Validate global state object
      expect(globalState).toEqual(state);
   };

   describe("Initialize state", () => {
      test("Should initialize state using dispatch method", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.click(dom.container.querySelector("#initialize"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: {
                  id: "name",
                  value: "initializeName",
                  error: null,
                  data: {
                     valid: undefined
                  }
               },
               password: {
                  id: "password",
                  value: "initializePassword",
                  error: null
               },
               text: {
                  id: "text",
                  value: "initializeText",
                  error: null
               },
               options: {
                  id: "options",
                  value: "1",
                  error: null
               },
               email: {
                  id: "email",
                  value: "initialize@gmail.com",
                  error: null
               },
               tags: {
                  id: "tags",
                  value: [ "Initialize" ],
                  error: null,
                  handlesChanges: true
               }
            });
         });
      });
   });

   describe("Update state", () => {
      test("Should update input state via dispatch", async() => {
         const dom = render(<Component />);

         // Validate password type management through icon within input component
         const passwordIcon = dom.container.querySelectorAll(".password-icon")[0];

         expect(passwordIcon).not.toBeNull();
         expect(globalState.password.data).toBeUndefined();
         expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "password");

         await act(async() => {
            await userEvent.click(passwordIcon);
            await userEvent.click(dom.container.querySelector("#tags"));
         });

         await waitFor(() => {
            expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "text");
            expect(globalState.password.data).toEqual({ type: "text" });
            expect(globalState.tags.value).toEqual(["Update"]);
         });

         // Validate input state changes with various events
         await act(async() => {
            await userEvent.click(passwordIcon);
            await userEvent.type(dom.container.querySelector("#name"), "user");
            await userEvent.keyboard("{Escape}");
            await userEvent.type(dom.container.querySelector("#password"), "password");
            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{Enter}");
            await userEvent.type(dom.container.querySelector("#email"), "user@gmail.com");
            await userEvent.keyboard("{Enter}");
            await userEvent.type(dom.container.querySelector("#text"), "testing");
            await userEvent.keyboard("{Escape}");
            await userEvent.selectOptions(dom.container.querySelector("#options"), "3");
            await userEvent.click(dom.container.querySelector("#tags"));
         });

         await waitFor(() => {
            expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "text");
            validateStateChanges(dom, {
               name: {
                  id: "name",
                  value: "user",
                  error: null,
                  data: {
                     valid: undefined
                  }
               },
               password: {
                  id: "password",
                  value: "password",
                  error: null,
                  data: {
                     type: "text"
                  }
               },
               text: {
                  id: "text",
                  value: "testing",
                  error: null
               },
               options: {
                  id: "options",
                  value: "3",
                  error: null
               },
               email: {
                  id: "email",
                  value: "user@gmail.com",
                  error: null
               },
               tags: {
                  id: "tags",
                  value: [ "Update", "Update" ],
                  error: null,
                  handlesChanges: true
               }
            });
         });
      });

      test("Should update multiple input states via dispatch", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.click(dom.container.querySelector("#updates"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: {
                  id: "name",
                  value: "updateName",
                  error: null,
                  handlesChanges: true,
                  data: {
                     valid: true
                  }
               },
               password: {
                  id: "password",
                  value: "",
                  error: null
               },
               text: {
                  id: "text",
                  value: "updateText",
                  error: null,
                  handlesChanges: true
               },
               options: {
                  id: "options",
                  value: "2",
                  error: null,
                  handlesChanges: true
               },
               email: {
                  id: "email",
                  value: "update@gmail.com",
                  error: null
               },
               tags: {
                  id: "tags",
                  value: [],
                  error: null,
                  handlesChanges: true
               }
            });
         });
      });

      test("Should update multiple input error states via dispatch", async() => {
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

            validateStateChanges(dom,  {
               name: {
                  id: "name",
                  value: "",
                  error: "Name must be at least 2 characters",
                  data: {
                     valid: undefined
                  }
               },
               password: {
                  id: "password",
                  value: "",
                  error: "Password must be non-empty"
               },
               text: {
                  id: "text",
                  value: "",
                  error: null
               },
               options: {
                  id: "options",
                  value: "1",
                  error: null
               },
               email: {
                  id: "email",
                  value: "", error:
                  null
               },
               tags: {
                  id: "tags",
                  value: [],
                  error: null,
                  handlesChanges: true
               }
            });
         });
      });

      test("Should validate no changes for inputs with handlesChanges defined", async() => {
         const dom = render(<Component />);

         // Apply handlesChanges to name, text, and options
         await act(async() => {
            await userEvent.click(dom.container.querySelector("#handles"));
         });

         await act(async() => {
            await userEvent.type(dom.container.querySelector("#name"), "Handles changes?");
            await userEvent.type(dom.container.querySelector("#text"), "Handles changes?");
            await userEvent.selectOptions(dom.container.querySelector("#options"), "3");
         });

         // Ensure user inputs led to no state changes by comparing with initial state
         await waitFor(() => {
            validateStateChanges(dom, {
               ...form,
               name: {
                  ...form.name,
                  handlesChanges: true
               },
               text: {
                  ...form.text,
                  handlesChanges: true
               },
               options: {
                  ...form.options,
                  handlesChanges: true
               }
            });
         });
      });
   });

   describe("Reset state", () => {
      test("Should reset multiple inputs state via dispatch", async() => {
         const dom = render(<Component />);

         await act(async() => {
            await userEvent.type(dom.container.querySelector("#name"), "newName");
            await userEvent.type(dom.container.querySelector("#password"), "newPassword");
            await userEvent.click(dom.container.querySelector("#reset"));
         });

         await waitFor(() => {
            validateStateChanges(dom, {
               name: {
                  id: "name",
                  value: "resetName",
                  error: null,
                  data: {
                     valid: false,
                     reset: true
                  }
               },
               password: {
                  id: "password",
                  value: "newPassword",
                  error: null
               },
               text: {
                  id: "text",
                  value: "resetText",
                  error: null
               },
               options: {
                  id: "options",
                  value: "1",
                  error: null
               },
               email: {
                  id: "email",
                  value: "",
                  error: null
               },
               tags: {
                  id: "tags",
                  value: [ "Reset" ],
                  error: null,
                  handlesChanges: true
               }
            });
         });
      });
   });
});
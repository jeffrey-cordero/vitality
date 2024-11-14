/** @jest-environment jsdom */
import userEvent from "@testing-library/user-event";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Select from "@/components/global/select";
import TextArea from "@/components/global/textarea";
import { sendErrorMessage } from "@/lib/global/response";
import { useEffect, useReducer } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { formReducer, VitalityState } from "@/lib/global/state";

const form: VitalityState = {
   name: {
      value: "",
      error: null,
      data: {
         valid: undefined
      }
   },
   password: {
      value: "",
      error: null,
      data: {}
   },
   text: {
      value: "",
      error: null,
      data: {}
   },
   options: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   tags: {
      value: [],
      error: null,
      data: {},
      handlesOnChange: true
   }
};

let globalState: VitalityState;

function StateTesting(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   useEffect(() => {
      globalState = state;
   }, [state]);

   return (
      <div className = "modal">
         <Input
            id = "name"
            type = "text"
            label = "Name"
            input = {state.name}
            dispatch = {dispatch}
            autoFocus
            required>
            {state.name.value}
         </Input>
         <Input
            id = "password"
            type = "password"
            label = "Password"
            input = {state.password}
            dispatch = {dispatch}>
            {state.name.value}
         </Input>
         <Input
            id = "email"
            type = "email"
            label = "Email"
            input = {state.email}
            dispatch = {dispatch}>
            {state.email.value}
         </Input>
         <TextArea
            id = "text"
            type = "text"
            label = "Text"
            input = {state.text}
            dispatch = {dispatch}
         />
         <Select
            id = "options"
            type = "text"
            values = {["", "1", "2", "3"]}
            label = "Options"
            input = {state.options}
            dispatch = {dispatch}
         />
         <div
            id = "tags"
            onClick = {() => {
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
            }}>
            {state.tags.value.toString()}
         </div>
         <Button
            id = "initialize"
            onClick = {() => {
               dispatch({
                  type: "initializeState",
                  value: {
                     name: {
                        ...state.name,
                        value: "test"
                     },
                     password: {
                        ...state.password,
                        value: ""
                     },
                     text: {
                        ...state.text,
                        value: "test-text"
                     },
                     options: {
                        ...state.text,
                        value: "2"
                     },
                     email: {
                        ...state.email,
                        value: "test@gmail.com"
                     },
                     tags: {
                        ...state.tags,
                        value: ["One", "Two", "Three"]
                     }
                  }
               });
            }}>
            Initialize State
         </Button>
         <Button
            id = "reset"
            onClick = {() => {
               dispatch({
                  type: "resetState",
                  value: {
                     name: {
                        value: "reset",
                        data: {
                           valid: false
                        }
                     },
                     text: {
                        value: "reset-text",
                        data: {}
                     },
                     tags: {
                        value: ["Four", "Five", "Six"],
                        data: {
                           updated: true
                        }
                     }

                  }
               });
            }}>
            Reset States
         </Button>
         <Button
            id = "updates"
            onClick = {() => {
               dispatch({
                  type: "updateStates",
                  value: {
                     name: {
                        ...state.name,
                        value: "updates",
                        data: {
                           valid: true
                        },
                        handlesOnChange: true
                     },
                     email: {
                        ...state.email,
                        value: "updates@gmail.com"
                     },
                     text: {
                        ...state.text,
                        handlesOnChange: true
                     },
                     options: {
                        ...state.options,
                        value: "3",
                        handlesOnChange: true
                     }
                  }
               });
            }}>
            Update Multiple States
         </Button>
         <Button
            id = "errors"
            onClick = {() => {
               const errors = {
                  name: ["Name must be at least 2 characters"],
                  text: ["Password must be non-empty"]
               };

               dispatch({
                  type: "updateErrors",
                  value: sendErrorMessage("Errors", errors)
               });
            }}>
            Update Errors
         </Button>
      </div>
   );
}

describe("State Management Validation", () => {
   test("Should properly initialize state and display appropriate changes", async() => {
      const dom = render(<StateTesting />);

      // Ensure empty values on initial render based on initial state
      expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe("");
      expect((dom.container.querySelector("#password") as HTMLInputElement).value).toBe("");
      expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe("");
      expect((dom.container.querySelector("#text") as HTMLTextAreaElement).value).toBe("");
      expect((dom.container.querySelector("#options") as HTMLSelectElement).value).toBe("");
      expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe("");

      // Click button for fire initialize state dispatch method
      await act(async() => {
         await userEvent.click(dom.container.querySelector("#initialize"));
      });

      // Validate changes in state
      await waitFor(() => {
         expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe("test");
         expect((dom.container.querySelector("#password") as HTMLInputElement).value).toBe("");
         expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe("test@gmail.com");
         expect((dom.container.querySelector("#text") as HTMLTextAreaElement).value).toBe("test-text");
         expect((dom.container.querySelector("#options") as HTMLSelectElement).value).toBe("2");
         expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe("One,Two,Three");
      });
   });

   test("Should ensure that all input-related components lead to updates in state", async() => {
      const dom = render(<StateTesting />);

      // Ensure password icons are visible
      expect(dom.container.querySelectorAll(".password-icon")).not.toBeNull();
      expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "password");
      expect(globalState.password.data).toEqual({});

      // Ensure password icon leads to changes in the input component and state
      await act(async() => {
         await userEvent.click(dom.container.querySelectorAll(".password-icon")[0]);
      });

      await waitFor(() => {
         expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "text");
         expect(globalState.password.data).toEqual({ type: "text" });
      });

      // Fire update events for each respective input
      await act(async() => {
         await userEvent.type(dom.container.querySelector("#name"), "Jeffrey");
         await userEvent.keyboard("{Escape}");
         await userEvent.type(dom.container.querySelector("#password"), "ValidPassword1$");
         await userEvent.keyboard("{Enter}");
         await userEvent.type(dom.container.querySelector("#email"), "Jeffrey@gmail.com");
         await userEvent.type(dom.container.querySelector("#text"), "Hello\nWorld");
         await userEvent.keyboard("{Escape}");
         await userEvent.selectOptions(dom.container.querySelector("#options"), "3");
         await userEvent.click(dom.container.querySelector("#tags"));
         await userEvent.click(dom.container.querySelectorAll(".password-icon")[0]);
      });

      // Validate changes in state
      await waitFor(() => {
         expect((dom.container.querySelector("#name") as HTMLInputElement).value).toBe("Jeffrey");
         expect((dom.container.querySelector("#password") as HTMLInputElement).value).toBe("ValidPassword1$");
         expect(dom.container.querySelector("#password") as HTMLInputElement).toHaveProperty("type", "password");
         expect((dom.container.querySelector("#email") as HTMLInputElement).value).toBe("Jeffrey@gmail.com");
         expect((dom.container.querySelector("#text") as HTMLTextAreaElement).value).toBe("Hello\nWorld");
         expect((dom.container.querySelector("#options") as HTMLSelectElement).value).toBe("3");
         expect((dom.container.querySelector("#tags") as HTMLDivElement).textContent).toBe("Extend");

         expect(globalState).toEqual({
            "name": { value: "Jeffrey", error: null, data: {} },
            "password": { value: "ValidPassword1$", error: null, data: { type: "password" } },
            "text": { value: "Hello\nWorld", error: null, data: {} },
            "options": { value: "3", error: null, data: {} },
            "email": { value: "Jeffrey@gmail.com", error: null, data: {} },
            "tags": { value: ["Extend"], error: null, data: {}, handlesOnChange: true }
         });
      });
   });

   test("Should validate bulk changes in state", async() => {
      const dom = render(<StateTesting />);

      // Fire reset state button click after altering some inputs
      await act(async() => {
         await userEvent.type(dom.container.querySelector("#name"), "Another");
         await userEvent.type(dom.container.querySelector("#password"), "AnotherPassword1$");
         await userEvent.click(dom.container.querySelector("#reset"));
      });

      await waitFor(() => {
         expect(globalState).toEqual({
            name: { value: "reset", error: null, data: { valid: false } },
            password: { value: "", error: null, data: {} },
            text: { value: "reset-text", error: null, data: {} },
            options: { value: "", error: null, data: {} },
            email: { value: "", error: null, data: {} },
            tags: {
               value: ["Four", "Five", "Six"],
               error: null,
               data: { updated: true },
               handlesOnChange: true
            }
         });
      });

      // Fire update multiple states button
      await act(async() => {
         await userEvent.click(dom.container.querySelector("#updates"));
      });

      await waitFor(() => {
         expect(globalState).toEqual({
            name: { value: "updates", error: null, data: { valid: true }, handlesOnChange: true },
            password: { value: "", error: null, data: {} },
            text: { value: "reset-text", error: null, data: {}, handlesOnChange: true },
            options: { value: "3", error: null, data: {}, handlesOnChange: true },
            email: { value: "updates@gmail.com", error: null, data: {} },
            tags: {
               value: ["Four", "Five", "Six"],
               error: null,
               data: { updated: true },
               handlesOnChange: true
            }
         });
      });

      // Fire update multiple errors button
      expect(dom.container.querySelectorAll(".input-error")).toHaveLength(0);

      await act(async() => {
         await userEvent.click(dom.container.querySelector("#errors"));
      });

      await waitFor(() => {
         // Ensure only two error containers are displaying their respective errors
         expect(dom.container.querySelectorAll(".input-error")).toHaveLength(2);
         expect(dom.container.querySelectorAll(".input-error")[0].textContent.trim())
            .toEqual("Name must be at least 2 characters");
         expect(dom.container.querySelectorAll(".input-error")[1].textContent.trim())
            .toEqual("Password must be non-empty");

         expect(globalState).toEqual({
            name: {
               value: "updates",
               error: "Name must be at least 2 characters",
               data: { valid: true },
               handlesOnChange: true
            },
            password: { value: "", error: null, data: {} },
            text: {
               value: "reset-text",
               error: "Password must be non-empty",
               data: {},
               handlesOnChange: true
            },
            options: { value: "3", error: null, data: {}, handlesOnChange: true },
            email: { value: "updates@gmail.com", error: null, data: {} },
            tags: {
               value: ["Four", "Five", "Six"],
               error: null,
               data: { updated: true },
               handlesOnChange: true
            }
         });
      });

      // Ensure all input components with handlesOnChange variable lead to no default changes in state based on event handling
      await act(async() => {
         await userEvent.type(dom.container.querySelector("#name"), "Handles");
         await userEvent.type(dom.container.querySelector("#text"), "Handles");
         await userEvent.selectOptions(dom.container.querySelector("#options"), "2");
      });

      await waitFor(() => {
         expect(globalState).toEqual({
            name: {
               value: "updates",
               error: "Name must be at least 2 characters",
               data: { valid: true },
               handlesOnChange: true
            },
            password: { value: "", error: null, data: {} },
            text: {
               value: "reset-text",
               error: "Password must be non-empty",
               data: {},
               handlesOnChange: true
            },
            options: { value: "3", error: null, data: {}, handlesOnChange: true },
            email: { value: "updates@gmail.com", error: null, data: {} },
            tags: {
               value: ["Four", "Five", "Six"],
               error: null,
               data: { updated: true },
               handlesOnChange: true
            }
         });
      });
   });
});
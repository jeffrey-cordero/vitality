import clsx from "clsx";
import PopUp from "@/components/global/popup";
import Input, { InputProps } from "@/components/global/input";
import Button from "@/components/global/button";
import Notification from "@/components/global/notification";
import { faGear, faXmark, faCloudArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/workouts";
import { AuthenticationContext } from "@/app/layout";
import { useContext, useEffect, useMemo } from "react";
import { FormResponse } from "@/lib/global/form";

const colors = {
   "Light gray": "rgb(55, 55, 55)",
   "Gray": "rgb(90, 90, 90)",
   "Brown": "rgb(96, 59, 44)",
   "Orange": "rgb(133, 76, 29)",
   "Yellow": "rgb(131, 94, 51)",
   "Green": "rgb(43, 89, 63)",
   "Blue": "rgb(40, 69, 108)",
   "Purple": "rgb(73, 47, 100)",
   "Pink": "rgb(105, 49, 76)",
   "Red": "rgb(110, 54, 48)"
};

// Store selected based on title's and id's
const tagsByTitle: { [title: string]: Tag } = {};

function searchForTag(tags: Tag[], search: string): Tag[] {
   // Handle no input for tag search
   if (search === "") {
      return tags;
   }

   // Simple search for tag based on starting with specific pattern
   return tags.filter(tag => tag.title.toLowerCase().startsWith(search));
}

function NewTagForm(props: InputProps, search: string, userId: string) {
   const handleSubmission = async () => {
      const tag: Tag = {
         user_id: userId,
         id: "",
         title: search,
         color: "rgb(90, 90, 90)"
      };

      const response = await addWorkoutTag(tag);

      if (!(response.status === "Success")) {
         // Display the respective error message
         props.dispatch({
            type: "updateStatus",
            value: response
         });
      } else {
         // Add the new tag (search pattern) to the overall user options
         props.dispatch({
            type: "updateInput",
            value: {
               ...props.input,
               data: {
                  ...props.input.data,
                  options: [...props.input.data.options, tag],
                  selected: [...props.input.data.selected, tag]
               }
            }
         });
      }
   };

   return (
      <div
         tabIndex={0}
         className="cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 p-3 rounded-2xl"
         onClick={() => {
            handleSubmission();
         }}
         onKeyDown={(event) => {
            if (event.key === "Enter") {
               handleSubmission();
            }
         }
         }
      >
         <h1>Create <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

function EditTagForm(props: InputProps, tag: Tag, colorsList: JSX.Element[]): JSX.Element {
   const handleSubmission = async (method: "update" | "delete") => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: props.input.data.inputs.editTitle.value,
         color: props.input.data.inputs.editColor.value,
      };

      const response: FormResponse = await updateWorkoutTag(payload, method);

      if (response.status !== "Success") {
         // Add respective errors, if any
         props.dispatch({
            type: "updateInput",
            value: {
               ...props.input,
               data: {
                  ...props.input.data,
                  inputs: {
                     editTitle: {
                        ...props.input.data.inputs.editTitle,
                        error: response.body.errors["title"] ?? null
                     },
                     editColor: {
                        ...props.input.data.inputs.editColor,
                        error: response.body.errors["color"] ?? null
                     }
                  }
               }
            }
         });
      } else {
         // Display simple success message and update tag options (update or delete)
         if (props.state !== undefined) {
            const { options, selected } = props.state.inputs.tags.data;

            const mapOrFilter = method === "update" ?
               (tag: Tag) => (tag.id === payload.id ? payload : tag) :
               (tag: Tag) => tag.id !== payload.id;

            const newOptions: Tag[] = method === "update" ? [...options.map(mapOrFilter)] : [...options.filter(mapOrFilter)];
            const newSelected: Tag[] = method === "update" ? [...selected.map(mapOrFilter)] : [...selected.filter(mapOrFilter)];

            props.dispatch({
               type: "updateFormState",
               value: {
                  status: "Success",
                  inputs: {
                     ...props.state.inputs,
                     tags: {
                        ...props.state.inputs.tags,
                        data: {
                           ...props.state.inputs.tags.data,
                           options: newOptions,
                           selected: newSelected,
                        }
                     }
                  },
                  response: response
               }
            });
         }
      }
   };

   return (
      <div className="flex flex-col justify-center align-center text-center gap-3 text-black">
         <div className="flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon={faGear}
               className="text-6xl text-primary mt-1"
            />
            <h1 className="text-3xl font-bold text-black mb-2">
               Edit Workout Tag
            </h1>
         </div>
         {/* Nested input props */}
         <Input
            input={props.input.data.inputs.editTitle} label="&#x1F58A; Title" dispatch={props.dispatch}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
               // Update editing title value
               props.dispatch({
                  type: "updateInput",
                  value: {
                     ...props.input,
                     data: {
                        ...props.input.data,
                        inputs: {
                           ...props.input.data.inputs,
                           editTitle: {
                              ...props.input.data.inputs.editTitle,
                              value: event.target.value,
                              error: null
                           }
                        }
                     }
                  }
               });
            }}
         />
         <div className="flex flex-col justify-center items-center gap-2">
            {
               colorsList
            }
            {/* Potential error message for invalid color in payload */}
            {props.input.data.inputs.editColor.error !== null &&
               <div className="flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className="text-red-500 font-bold input-error"> {props.input.data.inputs.editColor.error[0]} </p>
               </div>
            }
         </div>
         <div>
            <Button
               type="submit" className="bg-red-500 text-white w-full" icon={faTrash}
               onClick={() => handleSubmission("delete")}
            >
               Delete
            </Button>
         </div>
         <div>
            <Button
               type="submit" className="bg-primary text-white w-full" icon={faCloudArrowUp}
               onClick={() => handleSubmission("update")}
            >
               Save
            </Button>
         </div>
      </div>
   );
}

function TagsItem(props: InputProps, tag: Tag, colorsList: JSX.Element[], isSelected: boolean): JSX.Element {
   // Handle adding or removing a selected tag
   const handleOnClick = (adding: boolean) => {
      props.dispatch({
         type: "updateInput",
         value: {
            ...props.input,
            data: {
               ...props.input.data,
               // Add to selected options, if applicable, or remove
               selected: adding ? [...props.input.data.selected, tag] : [...props.input.data.selected].filter((other: Tag) => (other) !== tag)
            }
         }
      });
   };

   return (
      <div
         className={clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
         style={{
            backgroundColor: tag.color
         }}
         key={tag.id}
      >
         <div
            className="flex justify-center items-center gap-3 p-1"
            onClick={() => {
               if (!(isSelected)) {
                  handleOnClick(true);
               }
            }}
         >
            {/* Display pop up displaying entire title for readability */}
            <div className="cursor-pointer">
               {tag.title}
               {
                  isSelected &&
                  <FontAwesomeIcon
                     onMouseDown={() => handleOnClick(false)}
                     icon={faXmark}
                     className="cursor-pointer text-xs transition duration-300 ease-in-out hover:scale-125 hover:text-red-500"
                  />
               }
            </div>

            {
               <PopUp
                  className="max-w-2xl"
                  cover={
                     <FontAwesomeIcon
                        icon={faGear}
                        onClick={() => {
                           // Update edit tag information state
                           props.dispatch({
                              type: "updateInput",
                              value: {
                                 ...props.input,
                                 data: {
                                    ...props.input.data,
                                    inputs: {
                                       editTitle: {
                                          ...props.input.data.inputs.editTitle,
                                          value: tag.title
                                       },
                                       editColor: {
                                          ...props.input.data.inputs.editColor,
                                          value: tag.color
                                       }
                                    }
                                 }
                              }
                           });
                        }}
                        className="cursor-pointer text-xs hover:scale-125 transition duration-300 ease-in-out"
                     />
                  }
               >
                  {EditTagForm(props, tag, colorsList)}
               </PopUp>
            }
         </div>
      </div>
   );
};

export default function TagSelection(props: InputProps): JSX.Element {
   // Store user and search pattern
   const { user } = useContext(AuthenticationContext);

   // Store overall and selected tags
   const { options, selected } = props.input.data;

   // Convert search string to lower case for case-insensitive comparison
   const search = useMemo(() => {
      return props.state?.inputs.search.value.toLowerCase();
   }, [props.state?.inputs.search]);

   // Differentiate between selected and unselected options
   const selectedOptions = useMemo(() => {
      return new Set(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter((tag: Tag) => !(selectedOptions.has(tag)));
   }, [options, selectedOptions]);

   // Search results
   const results = useMemo(() => {
      return searchForTag(searchOptions, search);
   }, [searchOptions, search]);

   // Colors list within edit form pop up
   const colorsList: JSX.Element[] = useMemo(() => {
      return Object.keys(colors).map((name: string) => {
         const color: string = colors[name];

         return (
            <div
               style={{ backgroundColor: color }}
               className={clsx("cursor-pointer w-full h-[3rem]  border-[3px] rounded-sm p-3 text-white text-center", {
                  "border-primary scale-[1.02]": props.input.data.inputs.editColor.value === color,
                  "border-white": props.input.data.inputs.editColor.value !== color
               })}
               onClick={() => {
                  // Update editing color value
                  props.dispatch({
                     type: "updateInput",
                     value: {
                        ...props.input,
                        data: {
                           ...props.input.data,
                           inputs: {
                              ...props.input.data.inputs,
                              editColor: {
                                 ...props.input.data.inputs.editColor,
                                 value: color
                              }
                           }
                        }
                     }
                  });
               }}
               key={color}>
               {name}
            </div>
         )
      })
   }, [props.input.data.inputs.editColor.value]);

   return (
      <div>
         <div id="search-results" className="flex flex-col flex-wrap justify-center items-center gap-8">
            <ul className="flex flex-wrap justify-center items-center">
               {
                  selected.map((tag: Tag) => {
                     tagsByTitle[tag.title] = tag;
                     return TagsItem(props, tag, colorsList, true);
                  })
               }
            </ul>
            <ul className="flex flex-col flex-wrap justify-center items-center">
               {
                  results.length > 0 ? results.map((tag: Tag) => {
                     return TagsItem(props, tag, colorsList, false);
                  }) : search.trim().length > 0 && user !== undefined && tagsByTitle[search] === undefined && NewTagForm(props, search, user.id)
               }
            </ul>
         </div>
      </div>
   );
}
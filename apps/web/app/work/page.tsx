"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

import { Button } from "@workspace/ui/components/button";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useUIStore } from "@repo/store";
import { todoFormSchema, type TodoForm } from "@repo/schemas";


type Todo = {
  id: number;
  text: string;
  done: boolean;
  date: string;
  endDate: string;
};


const API_URL = "/api";

const api = {
  getTodos: async (): Promise<Todo[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch todos");
    const json = await res.json();
    return json.data; 
  },


  addTodo: async (data: TodoForm) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to add todo");
    const json = await res.json();
    return json.data;
  },

  updateTodo: async (id: number, data: Todo) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update todo");
     const json = await res.json();
    return json.data;
  },

  patchTodo: async (id: number, data: Partial<Todo>) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to patch todo");

     const json = await res.json();

    return json.data;
  },

  deleteTodo: async (id: number) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete todo");

     const json = await res.json();

    return json.data;
  },
};


export default function WorkPage() {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editTodo,
    openSheet,
    closeSheet,
    setEditTodo,
    clearEditTodo,
  } = useUIStore();

  const today = new Date().toISOString().split("T")[0];

  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: api.getTodos,
  });


  const addMutation = useMutation({
    mutationFn: api.addTodo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({id,data, }: {
      id: number;
      data: Todo;
    }) => api.updateTodo(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const patchMutation = useMutation({
    mutationFn: ({id,data,}: {
      id: number;
      data: Partial<Todo>;
    }) => api.patchTodo(id, data),

    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTodo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TodoForm>({
    resolver: zodResolver(todoFormSchema),

    defaultValues: {
      text: "",
      date: "",
      endDate: "",
      done: false,
    },
  });

  
  const onSubmit = (data: TodoForm) => {
    if (!editTodo) {
      addMutation.mutate({
        text: data.text,
        date: data.date.slice(0, 10),
        endDate: data.endDate.slice(0, 10),
        done: data.done,
      });
    } else {
      const updates: Partial<Todo> = {};

      if (data.text !== editTodo.text) updates.text = data.text;

      if (data.date !== editTodo.date)
        updates.date = data.date.slice(0, 10);

      if (data.endDate !== editTodo.endDate)
        updates.endDate = data.endDate.slice(0, 10);

      if (data.done !== editTodo.done)
        updates.done = data.done;

      const count = Object.keys(updates).length;

      if (count === 1) {
        patchMutation.mutate({
          id: editTodo.id,
          data: updates,
        });
      }

      if (count > 1) {
        updateMutation.mutate({
          id: editTodo.id,
          data: {
            ...editTodo,
            ...updates,
          },
        });
      }

      clearEditTodo();
    }

    reset();
    closeSheet();
  };

  
  const onDragStart = (e: React.DragEvent,id: number) => {
    e.dataTransfer.setData("taskId", String(id));
  };

  const onDrop = ( e: React.DragEvent,done: boolean) => {
    const id = Number(e.dataTransfer.getData("taskId"));

    patchMutation.mutate({
      id,
      data: { done },
    });
  };

  const allowDrop = (e: React.DragEvent) =>
    e.preventDefault();

  

  if (isLoading)
    return <div className="p-6">Loading...</div>;

  if (isError)
    return (
      <div className="p-6 text-red-600">
        {(error as Error).message}
      </div>
    );

  const progressItems = items.filter((i) => !i.done);
  const doneItems = items.filter((i) => i.done);

 
  return (
    <>

      <div className="flex justify-end">
        <Sheet open={sheetOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                reset();
                clearEditTodo();
                openSheet();
              }}
            >
              Add Todo
            </Button>
          </SheetTrigger>

        

          <SheetContent side="right" className="w-[420px]">
            <SheetHeader>
              <SheetTitle>
                {editTodo ? "Edit Todo" : "Add Todo"}
              </SheetTitle>
            </SheetHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 mt-6"
            >

              <div>
                <label>Text</label>

                <input
                  {...register("text")}
                  className="input"
                />

                {errors.text && (
                  <p className="text-red-500 text-xs">
                    {errors.text.message}
                  </p>
                )}
              </div>

              <div>
                <label>Status</label>

                <select
                  value={watch("done") ? "done" : "progress"}
                  onChange={(e) =>
                    setValue(
                      "done",
                      e.target.value === "done"
                    )
                  }
                  className="input"
                >
                  <option value="progress">
                    Progress
                  </option>

                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label>Start Date</label>

                <input
                  type="date"
                  min={today}
                  {...register("date")}
                  className="input"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label>End Date</label>

                <input
                  type="date"
                  min={today}
                  {...register("endDate")}
                  className="input"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                {editTodo ? "Update" : "Add"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div
          onDragOver={allowDrop}
          onDrop={(e) => onDrop(e, false)}
          className="border rounded-lg p-4"
        >
          <h3 className="font-semibold mb-3">
            In Progress
          </h3>

          {progressItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) =>
                onDragStart(e, item.id)
              }
              className="border rounded-md p-3 mb-2 flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {item.text}
                </p>

                <p className="text-xs text-gray-600">
                  {item.date} → {item.endDate}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditTodo(item);

                    setValue("text", item.text);
                    setValue("date", item.date);
                    setValue("endDate", item.endDate);
                    setValue("done", item.done);

                    openSheet();
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    deleteMutation.mutate(item.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

    

        <div
          onDragOver={allowDrop}
          onDrop={(e) => onDrop(e, true)}
          className="border rounded-lg p-4"
        >
          <h3 className="font-semibold mb-3">Done</h3>

          {doneItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) =>
                onDragStart(e, item.id)
              }
              className="border rounded-md p-3 mb-2 flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {item.text}
                </p>

                <p className="text-xs text-gray-600">
                  {item.date} → {item.endDate}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditTodo(item);
                    setValue("text", item.text);
                    setValue("date", item.date);
                    setValue("endDate", item.endDate);
                    setValue("done", item.done);

                    openSheet();
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    deleteMutation.mutate(item.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

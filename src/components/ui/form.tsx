"use client"

// @dthu/ui 0.2.0 · form
import * as React from "react"
import { Slot } from "radix-ui"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * Bọc `react-hook-form` (FormProvider). Dùng `useForm({ resolver: zodResolver(schema) })` rồi truyền kết quả qua `{...form}`.
 * Khi submit lỗi, ô lỗi đầu tiên tự nhận focus (shouldFocusError của react-hook-form).
 */
export const Form = FormProvider

interface FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
  name: TName
}
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)
const FormItemContext = React.createContext<{ id: string } | null>(null)

/** Liên kết một trường với react-hook-form (bọc `Controller`). Dùng `render={({ field }) => ...}`. */
export function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>,
) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/** Trả về id, trạng thái lỗi và các id liên kết (nhãn, mô tả, thông báo) của trường hiện tại. Chỉ dùng trong FormField. */
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext?.name })
  if (!fieldContext) throw new Error("useFormField phải được dùng bên trong <FormField>")
  const fieldState = getFieldState(fieldContext.name, formState)
  const id = itemContext?.id ?? ""
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

/** Khối một trường (nhãn + điều khiển + mô tả + lỗi); tạo id dùng chung cho aria. */
export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-[5px]", className)} {...props} />
    </FormItemContext.Provider>
  )
}

/** Nhãn của trường, tự gắn `htmlFor` và đổi màu khi lỗi. */
export function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()
  return <Label data-slot="form-label" data-error={!!error} className={cn("data-[error=true]:text-destructive", className)} htmlFor={formItemId} {...props} />
}

/** Bọc điều khiển (Input, Select...), tự gắn id, `aria-invalid` và `aria-describedby`. */
export function FormControl(props: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={!!error}
      {...props}
    />
  )
}

/** Mô tả phụ cho trường. */
export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()
  return <p data-slot="form-description" id={formDescriptionId} className={cn("text-label leading-[1.45] text-subtle-foreground", className)} {...props} />
}

/** Hiện thông báo lỗi của trường (từ resolver). Có thể truyền `children` để thay nội dung khi không có lỗi. */
export function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message ?? "") : children
  if (!body) return null
  return (
    <p data-slot="form-message" id={formMessageId} role={error ? "alert" : undefined} className={cn("text-label leading-[1.45] text-destructive", className)} {...props}>
      {body}
    </p>
  )
}

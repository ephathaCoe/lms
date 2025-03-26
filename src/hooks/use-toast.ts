import { useState } from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `${Date.now()}-${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  function addToast(props: Omit<ToasterToast, "id">) {
    const id = generateId()

    const newToast = {
      ...props,
      id,
    }

    setToasts((prevToasts) => {
      const updatedToasts = [newToast, ...prevToasts].slice(0, TOAST_LIMIT)
      return updatedToasts
    })

    setTimeout(() => {
      dismissToast(id)
    }, TOAST_REMOVE_DELAY)

    return id
  }

  function updateToast(id: string, props: Partial<ToasterToast>) {
    setToasts((prevToasts) => {
      const updatedToasts = prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...props } : toast
      )
      return updatedToasts
    })
  }

  function dismissToast(id: string) {
    setToasts((prevToasts) => {
      const updatedToasts = prevToasts.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
      return updatedToasts
    })

    setTimeout(() => {
      removeToast(id)
    }, 300)
  }

  function removeToast(id: string) {
    setToasts((prevToasts) => {
      const updatedToasts = prevToasts.filter((toast) => toast.id !== id)
      return updatedToasts
    })
  }

  return {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    removeToast,
  }
}
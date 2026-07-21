'use client'

import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { forwardRef, useImperativeHandle, useState } from 'react'

export interface ConfirmDialogHandle {
  confirm: (opts?: {
    title?: string
    description?: string
    confirmText?: string
    onConfirm?: () => void
  }) => void
}

export const ConfirmDialog = forwardRef<ConfirmDialogHandle, {}>(function ConfirmDialog(_props, ref) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('Konfirmasi')
  const [description, setDescription] = useState('Yakin ingin melanjutkan?')
  const [confirmText, setConfirmText] = useState('Hapus')
  const [cb, setCb] = useState<(() => void) | null>(null)

  useImperativeHandle(ref, () => ({
    confirm(opts) {
      if (opts?.title) setTitle(opts.title)
      if (opts?.description) setDescription(opts.description)
      if (opts?.confirmText) setConfirmText(opts.confirmText)
      setCb(() => opts?.onConfirm || null)
      setOpen(true)
    },
  }))

  return (
    <AlertDialog open={open} onOpenChange={(v: any) => setOpen(v)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => { cb?.(); setOpen(false) }}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

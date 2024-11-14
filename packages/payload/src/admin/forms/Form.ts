import { type SupportedLanguages } from '@payloadcms/translations'

import type { DocumentPermissions } from '../../auth/types.js'
import type { BlockAsField, Field, Validate } from '../../fields/config/types.js'
import type { TypedLocale } from '../../index.js'
import type { DocumentPreferences } from '../../preferences/types.js'
import type { PayloadRequest, Where } from '../../types/index.js'

export type Data = {
  [key: string]: any
}

export type Row = {
  blockType?: string
  collapsed?: boolean
  id: string
}

export type FilterOptionsResult = {
  [relation: string]: boolean | Where
}

export type FieldState = {
  customComponents?: {
    AfterInput?: React.ReactNode
    BeforeInput?: React.ReactNode
    Block?:
      | {
          Component: React.ComponentType<{ formData: Data }>
          type: 'client'
        }
      | {
          Component: React.ReactNode
          type: 'server'
        }
    BlockLabel?:
      | {
          Component: React.ComponentType<{ formData: Data }>
          type: 'client'
        }
      | {
          Component: React.ReactNode
          type: 'server'
        }
    Description?: React.ReactNode
    Error?: React.ReactNode
    Field?: React.ReactNode
    Label?: React.ReactNode
    RowLabels?: React.ReactNode[]
  }
  disableFormData?: boolean
  errorMessage?: string
  errorPaths?: string[]
  /**
   * The fieldSchema may be part of the form state if `includeSchema: true` is passed to buildFormState.
   * This will never be in the form state of the client.
   */
  fieldSchema?: BlockAsField | Field
  filterOptions?: FilterOptionsResult
  initialValue: unknown
  isSidebar?: boolean
  passesCondition?: boolean
  requiresRender?: boolean
  rows?: Row[]
  valid: boolean
  validate?: Validate
  value: unknown
}

export type FieldStateWithoutComponents = Omit<FieldState, 'customComponents'>

export type FormState = {
  [path: string]: FieldState
}

export type FormStateWithoutComponents = {
  [path: string]: FieldStateWithoutComponents
}

export type BuildFormStateArgs = {
  data?: Data
  docPermissions: DocumentPermissions | undefined
  docPreferences: DocumentPreferences
  fallbackLocale?: false | TypedLocale
  formState?: FormState
  id?: number | string
  /*
    If not i18n was passed, the language can be passed to init i18n
  */
  language?: keyof SupportedLanguages
  locale?: string
  operation?: 'create' | 'update'
  /*
    If true, will render field components within their state object
  */
  renderAllFields?: boolean
  req: PayloadRequest
  returnLockStatus?: boolean
  schemaPath: string
  updateLastEdited?: boolean
} & (
  | {
      collectionSlug: string
      // Do not type it as never. This still makes it so that either collectionSlug or globalSlug is required, but makes it easier to provide both collectionSlug and globalSlug if it's
      // unclear which one is actually available.
      globalSlug?: string
    }
  | {
      collectionSlug?: string
      globalSlug: string
    }
)

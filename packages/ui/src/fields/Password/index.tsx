'use client'
import type { Description, FormFieldBase, PasswordFieldValidation, PayloadRequest } from 'payload'

import { useConfig, useLocale, useTranslation } from '@payloadcms/ui'
import { password } from 'payload/shared'
import React, { useCallback } from 'react'

import { useField } from '../../forms/useField/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { isFieldRTL } from '../shared/index.js'
import './index.scss'
import { PasswordInput } from './input.js'

export type PasswordFieldProps = {
  autoComplete?: string
  className?: string
  description?: Description
  disabled?: boolean
  errorProps?: any // unknown type
  inputRef?: React.RefObject<HTMLInputElement>
  label?: string
  labelProps?: any // unknown type
  name: string
  path?: string
  placeholder?: string
  required?: boolean
  rtl?: boolean
  style?: React.CSSProperties
  validate?: PasswordFieldValidation
  width?: string
} & Pick<
  FormFieldBase,
  'AfterInput' | 'BeforeInput' | 'CustomDescription' | 'CustomError' | 'CustomLabel'
>

const PasswordFieldComponent: React.FC<PasswordFieldProps> = (props) => {
  const {
    name,
    AfterInput,
    BeforeInput,
    CustomDescription,
    CustomError,
    CustomLabel,
    autoComplete,
    className,
    disabled: disabledFromProps,
    errorProps,
    inputRef,
    label,
    labelProps,
    path: pathFromProps,
    placeholder,
    required,
    rtl,
    style,
    validate,
    width,
  } = props

  const { t } = useTranslation()
  const locale = useLocale()
  const config = useConfig()

  const memoizedValidate: PasswordFieldValidation = useCallback(
    (value, options) => {
      if (typeof validate === 'function') {
        return validate(value, { ...options, required })
      }

      return password(value, {
        name: 'password',
        type: 'text',
        data: {},
        preferences: { fields: {} },
        req: {
          payload: {
            config,
          },
          t,
        } as PayloadRequest,
        required: true,
        siblingData: {},
      })
    },
    [validate, config, t, required],
  )

  const { formInitializing, formProcessing, path, setValue, showError, value } = useField({
    path: pathFromProps || name,
    validate: memoizedValidate,
  })

  const disabled = disabledFromProps || formInitializing || formProcessing

  const renderRTL = isFieldRTL({
    fieldLocalized: false,
    fieldRTL: rtl,
    locale,
    localizationConfig: config.localization || undefined,
  })

  return (
    <PasswordInput
      AfterInput={AfterInput}
      BeforeInput={BeforeInput}
      CustomDescription={CustomDescription}
      CustomError={CustomError}
      CustomLabel={CustomLabel}
      autoComplete={autoComplete}
      className={className}
      errorProps={errorProps}
      inputRef={inputRef}
      label={label}
      labelProps={labelProps}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      path={path}
      placeholder={placeholder}
      readOnly={disabled}
      required={required}
      rtl={renderRTL}
      showError={showError}
      style={style}
      value={(value as string) || ''}
      width={width}
    />
  )
}

export const PasswordField = withCondition(PasswordFieldComponent)

'use client'
import type { DocumentPreferences, TabsFieldClientComponent } from 'payload'

import { getTranslation } from '@payloadcms/translations'
import { tabHasName, toKebabCase } from 'payload/shared'
import React, { useCallback, useEffect, useState } from 'react'

import { useCollapsible } from '../../elements/Collapsible/provider.js'
import { RenderFields } from '../../forms/RenderFields/index.js'
import { withCondition } from '../../forms/withCondition/index.js'
import { useDocumentInfo } from '../../providers/DocumentInfo/index.js'
import { usePreferences } from '../../providers/Preferences/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { FieldDescription } from '../FieldDescription/index.js'
import { fieldBaseClass } from '../shared/index.js'
import './index.scss'
import { TabsProvider } from './provider.js'
import { TabComponent } from './Tab/index.js'

const baseClass = 'tabs-field'

export { TabsProvider }

const TabsFieldComponent: TabsFieldClientComponent = (props) => {
  const {
    field: { admin: { className } = {}, tabs = [] },
    fieldState: { customComponents: { AfterInput, BeforeInput, Description } = {} } = {},
    forceRender = false,
    indexPath,
    path,
    readOnly,
  } = props

  const { getPreference, setPreference } = usePreferences()
  const { docPermissions, preferencesKey } = useDocumentInfo()
  const { i18n } = useTranslation()
  const { isWithinCollapsible } = useCollapsible()
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const tabsPrefKey = `tabs-${indexPath}`

  useEffect(() => {
    if (preferencesKey) {
      const getInitialPref = async () => {
        const existingPreferences: DocumentPreferences = await getPreference(preferencesKey)
        const initialIndex = path
          ? existingPreferences?.fields?.[path]?.tabIndex
          : existingPreferences?.fields?.[tabsPrefKey]?.tabIndex
        setActiveTabIndex(initialIndex || 0)
      }
      void getInitialPref()
    }
  }, [path, getPreference, preferencesKey, tabsPrefKey])

  const handleTabChange = useCallback(
    async (incomingTabIndex: number): Promise<void> => {
      setActiveTabIndex(incomingTabIndex)

      const existingPreferences: DocumentPreferences = await getPreference(preferencesKey)

      if (preferencesKey) {
        void setPreference(preferencesKey, {
          ...existingPreferences,
          ...(path
            ? {
                fields: {
                  ...(existingPreferences?.fields || {}),
                  [path]: {
                    ...existingPreferences?.fields?.[path],
                    tabIndex: incomingTabIndex,
                  },
                },
              }
            : {
                fields: {
                  ...existingPreferences?.fields,
                  [tabsPrefKey]: {
                    ...existingPreferences?.fields?.[tabsPrefKey],
                    tabIndex: incomingTabIndex,
                  },
                },
              }),
        })
      }
    },
    [preferencesKey, getPreference, setPreference, path, tabsPrefKey],
  )

  const activeTabConfig = tabs[activeTabIndex]

  function generateTabPath() {
    let tabPath = path
    if (path && tabHasName(activeTabConfig) && activeTabConfig.name) {
      tabPath = `${path}.${activeTabConfig.name}`
    } else if (!path && tabHasName(activeTabConfig) && activeTabConfig.name) {
      tabPath = activeTabConfig.name
    }

    return tabPath
  }

  const activeTabDescription = activeTabConfig.description
  const activeTabStaticDescription =
    typeof activeTabDescription === 'function'
      ? activeTabDescription({ t: i18n.t })
      : activeTabDescription

  return (
    <div
      className={[
        fieldBaseClass,
        className,
        baseClass,
        isWithinCollapsible && `${baseClass}--within-collapsible`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <TabsProvider>
        <div className={`${baseClass}__tabs-wrap`}>
          <div className={`${baseClass}__tabs`}>
            {tabs.map((tab, tabIndex) => {
              return (
                <TabComponent
                  isActive={activeTabIndex === tabIndex}
                  key={tabIndex}
                  parentPath={path}
                  setIsActive={() => {
                    void handleTabChange(tabIndex)
                  }}
                  tab={tab}
                />
              )
            })}
          </div>
        </div>
        <div className={`${baseClass}__content-wrap`}>
          {activeTabConfig && (
            <div
              className={[
                `${baseClass}__tab`,
                activeTabConfig.label &&
                  `${baseClass}__tabConfigLabel-${toKebabCase(
                    getTranslation(activeTabConfig.label, i18n),
                  )}`,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {Description ?? (
                <FieldDescription
                  description={activeTabStaticDescription}
                  path={generateTabPath()}
                />
              )}
              {BeforeInput}
              <RenderFields
                fields={activeTabConfig.fields}
                forceRender={forceRender}
                parentPath={generateTabPath().split('.')}
                permissions={docPermissions.fields}
                readOnly={readOnly}
              />
              {AfterInput}
            </div>
          )}
        </div>
      </TabsProvider>
    </div>
  )
}

export const TabsField = withCondition(TabsFieldComponent)

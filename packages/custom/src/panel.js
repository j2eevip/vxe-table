import VXETable from '../../v-x-e-table'
import UtilTools from '../../tools/utils'
import DomTools from '../../tools/dom'
import GlobalConfig from '../../v-x-e-table/src/conf'
import XEUtils from 'xe-utils'

const { formatText } = UtilTools
const { addClass, removeClass } = DomTools

function updateDropHint (_vm, evnt) {
  const { $refs } = _vm
  const dragHintEl = $refs.dragHintElemRef
  const bodyEl = $refs.bodyElemRef
  if (!bodyEl) {
    return
  }
  if (dragHintEl) {
    const wrapperEl = bodyEl.parentNode
    const wrapperRect = wrapperEl.getBoundingClientRect()
    dragHintEl.style.display = 'block'
    dragHintEl.style.top = `${Math.min(wrapperEl.clientHeight - wrapperEl.scrollTop - dragHintEl.clientHeight, evnt.clientY - wrapperRect.y)}px`
    dragHintEl.style.left = `${Math.min(wrapperEl.clientWidth - wrapperEl.scrollLeft - dragHintEl.clientWidth - 16, evnt.clientX - wrapperRect.x)}px`
  }
}

const renderSimplePanel = (h, _vm) => {
  const { _e, $xetable, customStore } = _vm
  const { customColumnList, customOpts, isMaxFixedColumn } = $xetable
  const { maxHeight } = customStore
  const { checkMethod, visibleMethod, allowVisible, allowSort, allowFixed, trigger, placement } = customOpts
  const colVNs = []
  const customWrapperOns = {}
  // hover 触发
  if (trigger === 'hover') {
    customWrapperOns.mouseenter = _vm.handleWrapperMouseenterEvent
    customWrapperOns.mouseleave = _vm.handleWrapperMouseleaveEvent
  }
  XEUtils.eachTree(customColumnList, (column, index, items, path, parent) => {
    const isVisible = visibleMethod ? visibleMethod({ column }) : true
    if (isVisible) {
      const isChecked = column.renderVisible
      const isIndeterminate = column.halfVisible
      const isColGroup = column.children && column.children.length
      const colTitle = formatText(column.getTitle(), 1)
      const isDisabled = checkMethod ? !checkMethod({ column }) : false
      colVNs.push(
        h('li', {
          key: column.id,
          attrs: {
            colid: column.id
          },
          class: ['vxe-table-custom--option', `level--${column.level}`, {
            'is--group': isColGroup
          }],
          on: {
            dragstart: _vm.sortDragstartEvent,
            dragend: _vm.sortDragendEvent,
            dragover: _vm.sortDragoverEvent
          }
        }, [
          allowVisible ? h('div', {
            class: ['vxe-table-custom--checkbox-option', {
              'is--checked': isChecked,
              'is--indeterminate': isIndeterminate,
              'is--disabled': isDisabled
            }],
            attrs: {
              title: GlobalConfig.i18n('vxe.custom.setting.colVisible')
            },
            on: {
              click: () => {
                if (!isDisabled) {
                  _vm.changeCheckboxOption(column)
                }
              }
            }
          }, [
            h('span', {
              class: ['vxe-checkbox--icon', isIndeterminate ? GlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE : (isChecked ? GlobalConfig.icon.TABLE_CHECKBOX_CHECKED : GlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED)]
            })
          ]) : _e(),
          allowSort && column.level === 1
            ? h('div', {
              class: 'vxe-table-custom--sort-option'
            }, [
              h('span', {
                class: 'vxe-table-custom--sort-btn',
                attrs: {
                  title: GlobalConfig.i18n('vxe.custom.setting.sortHelpTip')
                },
                on: {
                  mousedown: _vm.sortMousedownEvent,
                  mouseup: _vm.sortMouseupEvent
                }
              }, [
                h('i', {
                  class: GlobalConfig.icon.TABLE_CUSTOM_SORT
                })
              ])
            ])
            : _e(),
          h('div', {
            class: 'vxe-table-custom--checkbox-label',
            attrs: {
              title: colTitle
            }
          }, colTitle),
          !parent && allowFixed
            ? h('div', {
              class: 'vxe-table-custom--fixed-option'
            }, [
              h('span', {
                class: ['vxe-table-custom--fixed-left-option', column.renderFixed === 'left' ? GlobalConfig.icon.TOOLBAR_TOOLS_FIXED_LEFT_ACTIVE : GlobalConfig.icon.TOOLBAR_TOOLS_FIXED_LEFT, {
                  'is--checked': column.renderFixed === 'left',
                  'is--disabled': isMaxFixedColumn && !column.renderFixed
                }],
                attrs: {
                  title: GlobalConfig.i18n(column.renderFixed === 'left' ? 'vxe.toolbar.cancelFixed' : 'vxe.toolbar.fixedLeft')
                },
                on: {
                  click: () => {
                    _vm.changeFixedOption(column, 'left')
                  }
                }
              }),
              h('span', {
                class: ['vxe-table-custom--fixed-right-option', column.renderFixed === 'right' ? GlobalConfig.icon.TOOLBAR_TOOLS_FIXED_RIGHT_ACTIVE : GlobalConfig.icon.TOOLBAR_TOOLS_FIXED_RIGHT, {
                  'is--checked': column.renderFixed === 'right',
                  'is--disabled': isMaxFixedColumn && !column.renderFixed
                }],
                attrs: {
                  title: GlobalConfig.i18n(column.renderFixed === 'right' ? 'vxe.toolbar.cancelFixed' : 'vxe.toolbar.fixedRight')
                },
                on: {

                  click: () => {
                    _vm.changeFixedOption(column, 'right')
                  }
                }
              })
            ])
            : _e()
        ])
      )
    }
  })
  const isAllChecked = customStore.isAll
  const isAllIndeterminate = customStore.isIndeterminate
  return h('div', {
    key: 'simple',
    class: ['vxe-table-custom-wrapper', `placement--${placement}`, {
      'is--active': customStore.visible
    }],
    style: maxHeight && !['left', 'right'].includes(placement)
      ? {
          maxHeight: `${maxHeight}px`
        }
      : {}
  }, customStore.visible
    ? [
        h('ul', {
          class: 'vxe-table-custom--header'
        }, [
          h('li', {
            class: 'vxe-table-custom--option'
          }, [
            allowVisible
              ? h('div', {
                class: ['vxe-table-custom--checkbox-option', {
                  'is--checked': isAllChecked,
                  'is--indeterminate': isAllIndeterminate
                }],
                attrs: {
                  title: GlobalConfig.i18n('vxe.table.allTitle')
                },
                on: {
                  click: _vm.allCustomEvent
                }
              }, [
                h('span', {
                  class: ['vxe-checkbox--icon', isAllIndeterminate ? GlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE : (isAllChecked ? GlobalConfig.icon.TABLE_CHECKBOX_CHECKED : GlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED)]
                }),
                h('span', {
                  class: 'vxe-checkbox--label'
                }, GlobalConfig.i18n('vxe.toolbar.customAll'))
              ]) : h('span', {
                class: 'vxe-checkbox--label'
              }, GlobalConfig.i18n('vxe.table.customTitle'))
          ])
        ]),
        h('div', {
          ref: 'bodyElemRef',
          class: 'vxe-table-custom--list-wrapper'
        }, [
          h('transition-group', {
            class: 'vxe-table-custom--body',
            props: {
              name: 'vxe-table-custom--list',
              tag: 'ul'
            },
            on: customWrapperOns
          }, colVNs),
          h('div', {
            ref: 'dragHintElemRef',
            class: 'vxe-table-custom-popup--drag-hint'
          }, GlobalConfig.i18n('vxe.custom.cstmDragTarget', [_vm.dragColumn ? _vm.dragColumn.getTitle() : '']))
        ]),
        customOpts.showFooter
          ? h('div', {
            class: 'vxe-table-custom--footer'
          }, [
            h('button', {
              class: 'btn--reset',
              on: {
                click: _vm.resetCustomEvent
              }
            }, customOpts.resetButtonText || GlobalConfig.i18n('vxe.table.customRestore')),
            customOpts.immediate
              ? _e()
              : h('button', {
                class: 'btn--cancel',
                on: {
                  click: _vm.cancelCustomEvent
                }
              }, customOpts.resetButtonText || GlobalConfig.i18n('vxe.table.customCancel')),
            h('button', {
              class: 'btn--confirm',
              on: {
                click: _vm.confirmCustomEvent
              }
            }, customOpts.confirmButtonText || GlobalConfig.i18n('vxe.table.customConfirm'))
          ])
          : null
      ]
    : [])
}

const renderPopupPanel = (h, _vm) => {
  const { _e, $xetable, customStore } = _vm
  const { customOpts, customColumnList, columnOpts, isMaxFixedColumn } = $xetable
  const { allowVisible, allowSort, allowFixed, allowResizable, checkMethod, visibleMethod } = customOpts
  const trVNs = []
  XEUtils.eachTree(customColumnList, (column, index, items, path, parent) => {
    const isVisible = visibleMethod ? visibleMethod({ column }) : true
    if (isVisible) {
      const isChecked = column.renderVisible
      const isIndeterminate = column.halfVisible
      const colTitle = formatText(column.getTitle(), 1)
      const isColGroup = column.children && column.children.length
      const isDisabled = checkMethod ? !checkMethod({ column }) : false
      trVNs.push(
        h('tr', {
          key: column.id,
          attrs: {
            colid: column.id
          },
          class: [`vxe-table-custom-popup--row level--${column.level}`, {
            'is--group': isColGroup
          }],
          on: {
            dragstart: _vm.sortDragstartEvent,
            dragend: _vm.sortDragendEvent,
            dragover: _vm.sortDragoverEvent
          }
        }, [
          allowVisible ? h('td', {
            class: 'vxe-table-custom-popup--column-item col--visible'
          }, [
            h('div', {
              class: ['vxe-table-custom--checkbox-option', {
                'is--checked': isChecked,
                'is--indeterminate': isIndeterminate,
                'is--disabled': isDisabled
              }],
              attrs: {
                title: GlobalConfig.i18n('vxe.custom.setting.colVisible')
              },
              on: {
                click: () => {
                  if (!isDisabled) {
                    _vm.changeCheckboxOption(column)
                  }
                }
              }
            }, [
              h('span', {
                class: ['vxe-checkbox--icon', isIndeterminate ? GlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE : (isChecked ? GlobalConfig.icon.TABLE_CHECKBOX_CHECKED : GlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED)]
              })
            ])
          ]) : _e(),
          allowSort
            ? h('td', {
              class: 'vxe-table-custom-popup--column-item col--sort'
            }, [
              column.level === 1
                ? h('span', {
                  class: 'vxe-table-custom-popup--column-sort-btn',
                  attrs: {
                    title: GlobalConfig.i18n('vxe.custom.setting.sortHelpTip')
                  },
                  on: {
                    mousedown: _vm.sortMousedownEvent,
                    mouseup: _vm.sortMouseupEvent
                  }
                }, [
                  h('i', {
                    class: GlobalConfig.icon.TABLE_CUSTOM_SORT
                  })
                ])
                : h('span', '-')
            ])
            : _e(),
          h('td', {
            class: 'vxe-table-custom-popup--column-item col--name'
          }, [
            h('div', {
              class: 'vxe-table-custom-popup--name',
              attrs: {
                title: colTitle
              }
            }, colTitle)
          ]),
          allowResizable
            ? h('td', {
              class: 'vxe-table-custom-popup--column-item col--resizable'
            }, [
              !isChecked || (column.children && column.children.length)
                ? h('span', '-')
                : h('vxe-input', {
                  props: {
                    type: 'integer',
                    min: 40,
                    value: column.renderResizeWidth
                  },
                  on: {
                    modelValue (value) {
                      column.renderResizeWidth = Math.max(40, Number(value))
                    }
                  }
                })
            ])
            : _e(),
          allowFixed
            ? h('td', {
              class: 'vxe-table-custom-popup--column-item col--fixed'
            }, [
              parent
                ? h('span', '-')
                : h('vxe-radio-group', {
                  props: {
                    value: column.renderFixed || '',
                    type: 'button',
                    size: 'mini',
                    options: [
                      { label: GlobalConfig.i18n('vxe.custom.setting.fixedLeft'), value: 'left', disabled: isMaxFixedColumn },
                      { label: GlobalConfig.i18n('vxe.custom.setting.fixedUnset'), value: '' },
                      { label: GlobalConfig.i18n('vxe.custom.setting.fixedRight'), value: 'right', disabled: isMaxFixedColumn }
                    ]
                  },
                  on: {
                    input (value) {
                      column.renderFixed = value
                    }
                  // onChange () {
                  //   changePopupFixedOption(column)
                  // }
                  }
                })
            ])
            : _e()
        ])
      )
    }
  })
  const isAllChecked = customStore.isAll
  const isAllIndeterminate = customStore.isIndeterminate
  return h('vxe-modal', {
    key: 'popup',
    props: {
      className: 'vxe-table-custom-popup-wrapper vxe-table--ignore-clear',
      value: customStore.visible,
      title: GlobalConfig.i18n('vxe.custom.cstmTitle'),
      width: 700,
      minWidth: 700,
      height: 400,
      minHeight: 400,
      mask: true,
      lockView: true,
      showFooter: true,
      resize: true,
      escClosable: true,
      destroyOnClose: true
    },
    on: {
      input (value) {
        customStore.visible = value
      }
    },
    scopedSlots: {
      default: () => {
        return h('div', {
          ref: 'bodyElemRef',
          class: 'vxe-table-custom-popup--body'
        }, [
          h('div', {
            class: 'vxe-table-custom-popup--table-wrapper'
          }, [
            h('table', {}, [
              h('colgroup', {}, [
                allowVisible ? h('col', {
                  style: {
                    width: '80px'
                  }
                }) : _e(),
                allowSort
                  ? h('col', {
                    style: {
                      width: '80px'
                    }
                  })
                  : _e(),
                h('col', {
                  style: {
                    minWidth: '120px'
                  }
                }),
                allowResizable
                  ? h('col', {
                    style: {
                      width: '140px'
                    }
                  })
                  : _e(),
                allowFixed
                  ? h('col', {
                    style: {
                      width: '200px'
                    }
                  })
                  : _e()
              ]),
              h('thead', {}, [
                h('tr', {}, [
                  allowVisible ? h('th', {}, [
                    h('div', {
                      class: ['vxe-table-custom--checkbox-option', {
                        'is--checked': isAllChecked,
                        'is--indeterminate': isAllIndeterminate
                      }],
                      attrs: {
                        title: GlobalConfig.i18n('vxe.table.allTitle')
                      },
                      on: {
                        click: _vm.allCustomEvent
                      }

                    }, [
                      h('span', {
                        class: ['vxe-checkbox--icon', isAllIndeterminate ? GlobalConfig.icon.TABLE_CHECKBOX_INDETERMINATE : (isAllChecked ? GlobalConfig.icon.TABLE_CHECKBOX_CHECKED : GlobalConfig.icon.TABLE_CHECKBOX_UNCHECKED)]
                      }),
                      h('span', {
                        class: 'vxe-checkbox--label'
                      }, GlobalConfig.i18n('vxe.toolbar.customAll'))
                    ])
                  ]) : _e(),
                  allowSort
                    ? h('th', {}, [
                      h('span', {
                        class: 'vxe-table-custom-popup--table-sort-help-title'
                      }, GlobalConfig.i18n('vxe.custom.setting.colSort')),
                      h('vxe-tooltip', {
                        props: {
                          enterable: true,
                          content: GlobalConfig.i18n('vxe.custom.setting.sortHelpTip')
                        },
                        scopedSlots: {
                          default: () => {
                            return h('i', {
                              class: 'vxe-table-custom-popup--table-sort-help-icon vxe-icon-question-circle-fill'
                            })
                          }
                        }
                      })
                    ])
                    : _e(),
                  h('th', {}, GlobalConfig.i18n('vxe.custom.setting.colTitle')),
                  allowResizable
                    ? h('th', {}, GlobalConfig.i18n('vxe.custom.setting.colResizable'))
                    : _e(),
                  allowFixed
                    ? h('th', {}, GlobalConfig.i18n('vxe.custom.setting.colFixed', [columnOpts.maxFixedSize || 0]))
                    : _e()
                ])
              ]),
              h('transition-group', {
                class: 'vxe-table-custom--body',
                props: {
                  tag: 'tbody',
                  name: 'vxe-table-custom--list'
                }
              }, trVNs)
            ])
          ]),
          h('div', {
            ref: 'dragHintElemRef',
            class: 'vxe-table-custom-popup--drag-hint'
          }, GlobalConfig.i18n('vxe.custom.cstmDragTarget', [_vm.dragColumn ? _vm.dragColumn.getTitle() : '']))
        ])
      },
      footer: () => {
        return h('div', {
          class: 'vxe-table-custom-popup--footer'
        }, [
          h('vxe-button', {
            props: {
              content: customOpts.resetButtonText || GlobalConfig.i18n('vxe.custom.cstmRestore')
            },
            on: {
              click: _vm.resetCustomEvent
            }
          }),
          h('vxe-button', {
            props: {
              content: customOpts.resetButtonText || GlobalConfig.i18n('vxe.custom.cstmCancel')
            },
            on: {
              click: _vm.cancelCustomEvent
            }
          }),
          h('vxe-button', {
            props: {
              status: 'primary',
              content: customOpts.confirmButtonText || GlobalConfig.i18n('vxe.custom.cstmConfirm')
            },
            on: {
              click: _vm.confirmCustomEvent
            }
          })
        ])
      }
    }
  })
}

export default {
  name: 'VxeTableCustomPanel',
  props: {
    customStore: {
      type: Object,
      default: () => ({})
    }
  },
  inject: {
    $xetable: {
      default: null
    }
  },
  data () {
    return {
      dragColumn: null
    }
  },
  computed: {
  },
  render (h) {
    const { $xetable } = this
    const { customOpts } = $xetable
    if (customOpts.mode === 'popup') {
      return renderPopupPanel(h, this)
    }
    return renderSimplePanel(h, this)
  },
  methods: {
    handleWrapperMouseenterEvent (evnt) {
      const { $xetable, customStore } = this
      customStore.activeWrapper = true
      $xetable.customOpenEvent(evnt)
    },
    handleWrapperMouseleaveEvent  (evnt) {
      const { $xetable, customStore } = this
      customStore.activeWrapper = false
      setTimeout(() => {
        if (!customStore.activeBtn && !customStore.activeWrapper) {
          $xetable.customColseEvent(evnt)
        }
      }, 300)
    },
    getStoreData () {
      return {}
    },
    handleSaveStore (type) {
      const { $xetable } = this
      const { id, customOpts } = $xetable
      const { storage, updateStore } = customOpts
      if (storage && id && updateStore) {
        updateStore({
          id,
          type,
          storeData: $xetable.getCustomStoreData()
        })
      }
    },
    confirmCustomEvent  (evnt) {
      const { $xetable } = this
      const { customOpts, customColumnList } = $xetable
      const { allowVisible, allowSort, allowFixed, allowResizable } = customOpts
      XEUtils.eachTree(customColumnList, (column, index, items, path, parent) => {
        if (!parent) {
          if (allowSort) {
            const sortIndex = index + 1
            column.renderSortNumber = sortIndex
          }
          if (allowFixed) {
            column.fixed = column.renderFixed
          }
        }
        if (allowResizable) {
          if (column.renderVisible && (!column.children || column.children.length)) {
            if (column.renderResizeWidth !== column.renderWidth) {
              column.resizeWidth = column.renderResizeWidth
            }
          }
        }
        if (allowVisible) {
          column.visible = column.renderVisible
        }
      })
      $xetable.closeCustom()
      $xetable.emitCustomEvent('confirm', evnt)
      this.handleSaveStore('confirm')
    },
    cancelCustomEvent  (evnt) {
      const { $xetable } = this
      const { customStore, customOpts, customColumnList } = $xetable
      const { oldSortMaps, oldFixedMaps, oldVisibleMaps } = customStore
      const { allowVisible, allowSort, allowFixed, allowResizable } = customOpts
      XEUtils.eachTree(customColumnList, column => {
        const colid = column.getKey()
        const visible = !!oldVisibleMaps[colid]
        const fixed = oldFixedMaps[colid] || ''
        if (allowVisible) {
          column.renderVisible = visible
          column.visible = visible
        }
        if (allowFixed) {
          column.renderFixed = fixed
          column.fixed = fixed
        }
        if (allowSort) {
          column.renderSortNumber = oldSortMaps[colid] || 0
        }
        if (allowResizable) {
          column.renderResizeWidth = column.renderWidth
        }
      }, { children: 'children' })
      $xetable.closeCustom()
      $xetable.emitCustomEvent('cancel', evnt)
    },
    handleResetCustomEvent (evnt) {
      const { $xetable } = this
      $xetable.resetColumn(true)
      $xetable.closeCustom()
      $xetable.emitCustomEvent('reset', evnt)
      this.handleSaveStore('reset')
    },
    resetCustomEvent  (evnt) {
      if (VXETable.modal) {
        VXETable.modal.confirm({
          content: GlobalConfig.i18n('vxe.custom.cstmConfirmRestore'),
          className: 'vxe-table--ignore-clear',
          escClosable: true
        }).then(type => {
          if (type === 'confirm') {
            this.handleResetCustomEvent(evnt)
          }
        })
      } else {
        this.handleResetCustomEvent(evnt)
      }
    },
    resetPopupCustomEvent  (evnt) {
      if (VXETable.modal) {
        VXETable.modal.confirm({
          content: GlobalConfig.i18n('vxe.custom.cstmConfirmRestore'),
          className: 'vxe-table--ignore-clear',
          escClosable: true
        }).then(type => {
          if (type === 'confirm') {
            this.resetCustomEvent(evnt)
          }
        })
      } else {
        this.resetCustomEvent(evnt)
      }
    },
    handleOptionCheck (column) {
      const { $xetable } = this
      const { customColumnList } = $xetable
      const matchObj = XEUtils.findTree(customColumnList, item => item === column)
      if (matchObj && matchObj.parent) {
        const { parent } = matchObj
        if (parent.children && parent.children.length) {
          parent.visible = parent.children.every((column) => column.visible)
          parent.halfVisible = !parent.visible && parent.children.some((column) => column.visible || column.halfVisible)
          this.handleOptionCheck(parent)
        }
      }
    },
    changeCheckboxOption (column) {
      const { $xetable } = this
      const { customOpts } = $xetable
      const isChecked = !column.renderVisible
      XEUtils.eachTree([column], (item) => {
        item.renderVisible = isChecked
        item.halfVisible = false
      })
      this.handleOptionCheck(column)
      if (customOpts.immediate) {
        $xetable.handleCustom()
      }
      $xetable.checkCustomStatus()
    },
    changeFixedOption  (column, colFixed) {
      const { $xetable } = this
      const { isMaxFixedColumn } = $xetable
      if (column.renderFixed === colFixed) {
        column.renderFixed = ''
        // $xeTable.clearColumnFixed(column)
      } else {
        if (!isMaxFixedColumn || column.renderFixed) {
          column.renderFixed = colFixed
          // $xeTable.setColumnFixed(column, colFixed)
        }
      }
    },
    // changePopupFixedOption  (column) {
    //   const { $xetable } = this
    //   const { isMaxFixedColumn } = $xetable
    //   if (!isMaxFixedColumn) {
    //     $xetable.setColumnFixed(column, column.fixed)
    //   }
    // },
    allCustomEvent () {
      const { $xetable, customStore } = this
      const { customOpts, customColumnList } = $xetable
      const { checkMethod } = customOpts
      const isAll = !customStore.isAll
      XEUtils.eachTree(customColumnList, (column) => {
        if (!checkMethod || checkMethod({ column })) {
          column.renderVisible = isAll
          column.halfVisible = false
        }
      })
      customStore.isAll = isAll
      $xetable.checkCustomStatus()
    },
    sortMousedownEvent (evnt) {
      const { $xetable } = this
      const btnEl = evnt.currentTarget
      const tdEl = btnEl.parentNode
      const trEl = tdEl.parentNode
      const colid = trEl.getAttribute('colid')
      const column = $xetable.getColumnById(colid)
      trEl.draggable = true
      this.dragColumn = column
      addClass(trEl, 'active--drag-origin')
    },
    sortMouseupEvent  (evnt) {
      const btnEl = evnt.currentTarget
      const tdEl = btnEl.parentNode
      const trEl = tdEl.parentNode
      const dragHintEl = this.$refs.dragHintElemRef
      trEl.draggable = false
      this.dragColumn = null
      removeClass(trEl, 'active--drag-origin')
      if (dragHintEl) {
        dragHintEl.style.display = ''
      }
    },
    sortDragstartEvent (evnt) {
      const img = new Image()
      if (evnt.dataTransfer) {
        evnt.dataTransfer.setDragImage(img, 0, 0)
      }
    },
    sortDragendEvent (evnt) {
      const { $xetable, prevDropTrEl } = this
      const { customColumnList } = $xetable
      const trEl = evnt.currentTarget
      const dragHintEl = this.$refs.dragHintElemRef
      if (prevDropTrEl) {
        // 判断是否有拖动
        if (prevDropTrEl !== trEl) {
          const dragOffset = prevDropTrEl.getAttribute('drag-pos')
          const colid = trEl.getAttribute('colid')
          const column = $xetable.getColumnById(colid)
          if (!column) {
            return
          }
          const cIndex = XEUtils.findIndexOf(customColumnList, item => item.id === column.id)
          const targetColid = prevDropTrEl.getAttribute('colid')
          const targetColumn = $xetable.getColumnById(targetColid)
          if (!targetColumn) {
            return
          }
          // 移出源位置
          customColumnList.splice(cIndex, 1)
          const tcIndex = XEUtils.findIndexOf(customColumnList, item => item.id === targetColumn.id)
          // 插新位置
          customColumnList.splice(tcIndex + (dragOffset === 'bottom' ? 1 : 0), 0, column)
        }
        prevDropTrEl.draggable = false
        prevDropTrEl.removeAttribute('drag-pos')
        removeClass(prevDropTrEl, 'active--drag-target')
      }
      this.dragColumn = null
      trEl.draggable = false
      trEl.removeAttribute('drag-pos')
      if (dragHintEl) {
        dragHintEl.style.display = ''
      }
      removeClass(trEl, 'active--drag-target')
      removeClass(trEl, 'active--drag-origin')
    },
    sortDragoverEvent  (evnt) {
      const { $xetable, prevDropTrEl } = this
      const trEl = evnt.currentTarget
      if (prevDropTrEl !== trEl) {
        removeClass(prevDropTrEl, 'active--drag-target')
      }
      const colid = trEl.getAttribute('colid')
      const column = $xetable.getColumnById(colid)
      // 是否移入有效元行
      if (column && column.level === 1) {
        evnt.preventDefault()
        const offsetY = evnt.clientY - trEl.getBoundingClientRect().y
        const dragOffset = offsetY < trEl.clientHeight / 2 ? 'top' : 'bottom'
        addClass(trEl, 'active--drag-target')
        trEl.setAttribute('drag-pos', dragOffset)
        this.prevDropTrEl = trEl
      }
      updateDropHint(this, evnt)
    }
  }
}

import XEUtils from 'xe-utils/methods/xe-utils'
import { UtilTools, DomTools } from '../../tools'
import VXETable from '../../v-x-e-table'

function handleExport ($table, opts, oColumns, fullData) {
  const { columns, datas } = getExportData($table, opts, fullData, oColumns)
  return $table.preventEvent(null, 'event.export', { $table, options: opts, columns, datas }, () => {
    return downloadFile(opts, getContent($table, opts, columns, datas))
  })
}

function getContent ($table, opts, columns, datas) {
  const { type } = opts
  if (type === 'csv') {
    return toCsv($table, opts, columns, datas)
  } else if (type === 'txt') {
    return toTxt($table, opts, columns, datas)
  } else if (type === 'html') {
    return toHtml($table, opts, columns, datas)
  } else if (type === 'xml') {
    return toXML($table, opts, columns, datas)
  }
  return ''
}

function toCsv ($table, opts, columns, datas) {
  const isOriginal = opts.original
  let content = '\ufeff'
  if (opts.isHeader) {
    content += columns.map(column => `"${column.getTitle()}"`).join(',') + '\n'
  }
  datas.forEach((row, rowIndex) => {
    if (isOriginal) {
      content += columns.map(column => {
        if (column.type === 'index') {
          return `"${column.indexMethod ? column.indexMethod(rowIndex) : rowIndex + 1}"`
        }
        return `"${UtilTools.getCellValue(row, column) || ''}"`
      }).join(',') + '\n'
    } else {
      content += columns.map(column => `"${row[column.id]}"`).join(',') + '\n'
    }
  })
  if (opts.isFooter) {
    let footerData = $table.footerData
    let footers = opts.footerFilterMethod ? footerData.filter(opts.footerFilterMethod) : footerData
    let filterMaps = $table.tableColumn.map(column => columns.includes(column))
    footers.forEach(rows => {
      content += rows.filter((val, colIndex) => `"${filterMaps[colIndex]}"`).join(',') + '\n'
    })
  }
  return content
}

function toTxt ($table, opts, columns, datas) {
  const isOriginal = opts.original
  let content = ''
  if (opts.isHeader) {
    content += columns.map(column => `${column.getTitle()}`).join('\t') + '\n'
  }
  datas.forEach((row, rowIndex) => {
    if (isOriginal) {
      content += columns.map(column => {
        if (column.type === 'index') {
          return `${column.indexMethod ? column.indexMethod(rowIndex) : rowIndex + 1}`
        }
        return `"${UtilTools.getCellValue(row, column) || ''}"`
      }).join('\t') + '\n'
    } else {
      content += columns.map(column => `${row[column.id]}`).join('\t') + '\n'
    }
  })
  if (opts.isFooter) {
    let footerData = $table.footerData
    let footers = opts.footerFilterMethod ? footerData.filter(opts.footerFilterMethod) : footerData
    let filterMaps = $table.tableColumn.map(column => columns.includes(column))
    footers.forEach(rows => {
      content += rows.filter((val, colIndex) => `${filterMaps[colIndex]}`).join('\t') + '\n'
    })
  }
  return content
}

function toHtml ($table, opts, columns, datas) {
  const isOriginal = opts.original
  let html = [
    '<!DOCTYPE html>',
    '<html>',
    `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui"><title>${opts.sheetName}</title></head>`,
    '<body>',
    '<table border="1" cellspacing="0" cellpadding="0">',
    `<colgroup>${columns.map(column => `<col width="${column.renderWidth}">`).join('')}</colgroup>`
  ].join('')
  if (opts.isHeader) {
    html += `<thead><tr>${columns.map(column => `<th>${column.getTitle()}</th>`).join('')}</tr></thead>`
  }
  if (datas.length) {
    html += '<tbody>'
    datas.forEach((row, rowIndex) => {
      html += '<tr>'
      if (isOriginal) {
        html += columns.map(column => {
          if (column.type === 'index') {
            return `<td>${column.indexMethod ? column.indexMethod(rowIndex) : rowIndex + 1}</td>`
          }
          return `<td>${UtilTools.getCellValue(row, column) || ''}</td>`
        }).join('')
      } else {
        html += columns.map(column => `<td>${row[column.id]}</td>`).join('')
      }
      html += '</tr>'
    })
    html += '</tbody>'
  }
  if (opts.isFooter) {
    let footerData = $table.footerData
    let footers = opts.footerFilterMethod ? footerData.filter(opts.footerFilterMethod) : footerData
    let filterMaps = $table.tableColumn.map(column => columns.includes(column))
    if (footers.length) {
      html += '<tfoot>'
      footers.forEach(rows => {
        html += `<tr>${rows.filter((val, colIndex) => `<td>${filterMaps[colIndex]}</td>`).join('')}</tr>`
      })
      html += '</tfoot>'
    }
  }
  return html + '</table></body></html>'
}

function toXML ($table, opts, columns, datas) {
  const isOriginal = opts.original
  let xml = [
    '<?xml version="1.0"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">',
    '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">',
    '<Version>16.00</Version>',
    '</DocumentProperties>',
    '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">',
    '<WindowHeight>7920</WindowHeight>',
    '<WindowWidth>21570</WindowWidth>',
    '<WindowTopX>32767</WindowTopX>',
    '<WindowTopY>32767</WindowTopY>',
    '<ProtectStructure>False</ProtectStructure>',
    '<ProtectWindows>False</ProtectWindows>',
    '</ExcelWorkbook>',
    `<Worksheet ss:Name="${opts.sheetName}">`,
    '<Table>',
    columns.map(column => `<Column ss:Width="${column.renderWidth}"/>`).join('')
  ].join('')
  if (opts.isHeader) {
    xml += `<Row>${columns.map(column => `<Cell><Data ss:Type="String">${column.getTitle()}</Data></Cell>`).join('')}</Row>`
  }
  datas.forEach((row, rowIndex) => {
    xml += '<Row>'
    if (isOriginal) {
      xml += columns.map(column => {
        if (column.type === 'index') {
          return `<Cell><Data ss:Type="String">${column.indexMethod ? column.indexMethod(rowIndex) : rowIndex + 1}</Data></Cell>`
        }
        return `<Cell><Data ss:Type="String">${UtilTools.getCellValue(row, column) || ''}</Data></Cell>`
      }).join('')
    } else {
      xml += columns.map(column => `<Cell><Data ss:Type="String">${row[column.id]}</Data></Cell>`).join('')
    }
    xml += '</Row>'
  })
  if (opts.isFooter) {
    let footerData = $table.footerData
    let footers = opts.footerFilterMethod ? footerData.filter(opts.footerFilterMethod) : footerData
    let filterMaps = $table.tableColumn.map(column => columns.includes(column))
    if (footers.length) {
      footers.forEach(rows => {
        xml += `<Row>${rows.filter((val, colIndex) => `<Cell><Data ss:Type="String">${filterMaps[colIndex]}</Data></Cell>`).join('')}</Row>`
      })
    }
  }
  return `${xml}</Table></Worksheet></Workbook>`
}

function downloadFile (opts, content) {
  const { filename, type, download } = opts
  const name = `${filename}.${type}`
  if (!download) {
    return Promise.resolve(content)
  }
  if (window.Blob) {
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(new Blob([content]), name)
    } else {
      var linkElem = document.createElement('a')
      linkElem.target = '_blank'
      linkElem.download = name
      linkElem.href = URL.createObjectURL(new Blob([content]))
      document.body.appendChild(linkElem)
      linkElem.click()
      document.body.removeChild(linkElem)
    }
  } else {
    UtilTools.error('vxe.error.notExp')
  }
}

function getLabelData ($table, columns, datas) {
  return datas.map(row => {
    let item = {}
    columns.forEach(column => {
      let cell = DomTools.getCell($table, { row, column })
      item[column.id] = cell ? cell.innerText.trim() : ''
    })
    return item
  })
}

function getExportData ($table, opts, fullData, oColumns) {
  let columns = opts.columns ? opts.columns : oColumns
  let datas = opts.data || fullData
  if (opts.columnFilterMethod) {
    columns = columns.filter(opts.columnFilterMethod)
  }
  if (opts.dataFilterMethod) {
    datas = datas.filter(opts.dataFilterMethod)
  }
  return { columns, datas: opts.original ? datas : getLabelData($table, columns, datas) }
}

export default {
  methods: {
    // 在 v3.0 中废弃 exportCsv 方法
    _exportCsv (options) {
      UtilTools.warn('vxe.error.delFunc', ['exportCsv', 'exportData'])
      return this.exportData(options)
    },
    /**
     * 导出文件，支持 csv/html/xml
     * 如果是树表格，则默认是导出所有节点
     * 如果是启用了虚拟滚动，则只能导出数据源，可以配合 dataFilterMethod 函数自行转换数据
     * @param {Object} options 参数
     */
    _exportData (options) {
      let { visibleColumn, scrollXLoad, scrollYLoad, treeConfig } = this
      let types = Object.keys(VXETable.types)
      let opts = Object.assign({
        filename: '',
        sheetName: '',
        original: !!treeConfig,
        isHeader: true,
        isFooter: true,
        download: true,
        type: 'csv',
        data: null,
        columns: null,
        columnFilterMethod: null,
        dataFilterMethod: null,
        footerFilterMethod: null
      }, options)
      if (!opts.filename) {
        opts.filename = 'export'
      }
      if (!opts.sheetName) {
        opts.sheetName = 'Sheet1'
      }
      if (!types.includes(opts.type)) {
        throw new Error(UtilTools.getLog('vxe.error.notType', [opts.type]))
      }
      if (!opts.original) {
        if (scrollXLoad || scrollYLoad) {
          opts.original = true
          UtilTools.warn('vxe.error.scrollOriginal')
        }
      }
      if (!options || !options.columns) {
        // 在 v3.0 中废弃 type=selection
        opts.columnFilterMethod = column => column.property && ['index', 'checkbox', 'selection', 'radio'].indexOf(column.type) === -1
      }
      let columns = visibleColumn
      let fullData = this.tableFullData
      if (treeConfig) {
        fullData = XEUtils.toTreeArray(fullData, treeConfig)
      }
      return handleExport(this, opts, columns, fullData)
    }
  }
}

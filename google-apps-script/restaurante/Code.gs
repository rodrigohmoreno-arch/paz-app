// HOTEL EPECUEN - SISTEMA DE RESTAURANTE
// ============================================

const CONFIG = {
  SPREADSHEET_NAME: 'Hotel Epecuen - Sistema Restaurante',
  HOJAS: ['Config', 'Productos', 'Stock', 'Platos', 'Recetas', 'Mesas', 'Comandas', 'ComandasDetalle', 'Huespedes', 'VouchersCarhue', 'Cierres', 'CierresDetalle', 'Cobros', 'Usuarios', 'HistorialStock', 'AuditoriaEliminaciones', 'ConsumosHuespedes', 'ListadosDiariosCarhue'],
  ROLES_PERMITIDOS: {
    'abrirMesa': ['MOZO', 'ADMIN'],
    'agregarItemComanda': ['MOZO', 'ADMIN'],
    'eliminarItemComanda': ['MOZO', 'ADMIN'],
    'cerrarMesaSinCobro': ['MOZO', 'ADMIN'],
    'pasarAFacturacion': ['MOZO', 'ADMIN'],
    'facturarMesa': ['CAJA', 'ADMIN'],
    'cerrarYFacturar': ['CAJA', 'ADMIN'],
    'actualizarStock': ['STOCK', 'ADMIN'],
    'agregarProducto': ['STOCK', 'ADMIN'],
    'guardarReceta': ['CHEF', 'ADMIN'],
    'agregarPlato': ['CHEF', 'ADMIN'],
    'crearVoucherCarhue': ['CARHUE_RECEPCION', 'ADMIN'],
    'enviarListadoDiarioCarhue': ['CARHUE_RECEPCION', 'ADMIN']
  }
};

function doGet(e) {
  inicializarSistema();
  try {
    const html = HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hotel Epecuen - Restaurante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return html;
  } catch(error) {
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1><p>No se pudo cargar Index.html</p><p>Error: ' + error.toString() + '</p>'
    );
  }
}

function inicializarSistema() {
  let ss;
  // Intentar abrir por ID cacheado primero (mas rapido que buscar por nombre)
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch(e) {
      ssId = null;
    }
  }
  if (!ss) {
    try {
      const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
      }
    } catch(e) {
      ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    }
    // Cachear ID para futuras llamadas
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  CONFIG.HOJAS.forEach(function(nombreHoja) {
    let hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) {
      hoja = ss.insertSheet(nombreHoja);
      SpreadsheetApp.flush();
    }
    if (hoja) {
      inicializarHoja(nombreHoja, hoja);
    }
  });

  try {
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }
  } catch(e) {}

  return ss.getUrl();
}

function inicializarHoja(nombre, hoja) {
  if (!hoja) return;
  // Solo inicializar si la hoja esta vacia (no borrar datos existentes)
  try {
    if (hoja.getLastRow() > 0) return;
  } catch(e) { return; }

  switch(nombre) {

    case 'Config':
      var configData = [
        ['PARAMETRO', 'VALOR'],
        ['Nombre Hotel', 'Hotel Epecuen'],
        ['Hotel Cadena', 'Hotel Carhue'],
        ['Bebidas incluidas MAP', ''],
        ['Descuento maximo efectivo %', '15'],
        ['IVA %', '21'],
        ['Ultimo ID Comanda', '0'],
        ['Ultimo ID Cierre', '0'],
        ['Ultimo ID Voucher', '0'],
        ['Ultimo ID Listado', '0'],
        ['Fecha inicializacion', new Date()],
        ['Version', '1.0'],
        ['', ''],
        ['UBICACIONES MESAS', ''],
        ['Salon', 'Mesa 1, Mesa 2, Mesa 3, Mesa 4, Mesa 5, Mesa 6'],
        ['Consumos Externos', 'Ext 1, Ext 2, Ext 3, Ext 4, Ext 5, Ext 6'],
        ['', ''],
        ['TIPOS CLIENTE', ''],
        ['Alojado Epecuen MAP', 'Solo bebidas extra'],
        ['Alojado Epecuen SIN MAP', 'Todo abona'],
        ['Hotel Carhue', 'Solo bebidas'],
        ['Consumidor Final', 'Todo abona']
      ];
      hoja.getRange(1, 1, configData.length, 2).setValues(configData);
      hoja.getRange('A1:B1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      break;

    case 'Productos':
      hoja.getRange('A1:I1').setValues([['ID', 'Categoria', 'Nombre', 'Unidad', 'Precio Costo', 'Precio Venta', 'Activo', 'Fecha Modificacion', 'Sector']]);
      hoja.getRange('A1:I1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      var productosData = [
        [1, 'Bebidas', 'Coca Cola 500ml', 'unidad', 450, 900, 'SI', new Date(), 'MOSTRADOR'],
        [2, 'Bebidas', 'Agua sin gas 500ml', 'unidad', 200, 500, 'SI', new Date(), 'MOSTRADOR'],
        [3, 'Bebidas', 'Cerveza Artesanal', 'unidad', 600, 1200, 'SI', new Date(), 'MOSTRADOR'],
        [4, 'Bebidas', 'Vino Tinto Copa', 'copa', 800, 1800, 'SI', new Date(), 'MOSTRADOR'],
        [5, 'Bebidas', 'Gaseosa Linea', 'unidad', 350, 700, 'SI', new Date(), 'MOSTRADOR'],
        [6, 'Entradas', 'Bruschetta', 'plato', 1200, 2500, 'SI', new Date(), 'COCINA'],
        [7, 'Entradas', 'Tabla de Fiambres', 'plato', 2500, 5500, 'SI', new Date(), 'COCINA'],
        [8, 'Platos Principales', 'Milanesa Napolitana', 'plato', 2800, 6500, 'SI', new Date(), 'COCINA'],
        [9, 'Platos Principales', 'Pasta Bolognesa', 'plato', 2200, 5500, 'SI', new Date(), 'COCINA'],
        [10, 'Platos Principales', 'Parrillada para 2', 'plato', 5500, 12000, 'SI', new Date(), 'COCINA'],
        [11, 'Postres', 'Flan Casero', 'plato', 600, 1500, 'SI', new Date(), 'COCINA'],
        [12, 'Postres', 'Helado Artesanal', 'plato', 800, 2000, 'SI', new Date(), 'COCINA'],
        [13, 'Cafeteria', 'Cafe Expreso', 'taza', 300, 800, 'SI', new Date(), 'COCINA'],
        [14, 'Cafeteria', 'Medialunas x3', 'porcion', 500, 1200, 'SI', new Date(), 'COCINA'],
        [15, 'Piscina', 'Trago del Dia', 'vaso', 800, 1800, 'SI', new Date(), 'MOSTRADOR'],
        [16, 'Platos Principales', 'Menu MAP', 'plato', 0, 0, 'SI', new Date(), 'COCINA']
      ];
      hoja.getRange(2, 1, productosData.length, 9).setValues(productosData);
      break;

    case 'Stock':
      hoja.getRange('A1:F1').setValues([['ID Producto', 'Producto', 'Stock Actual', 'Stock Minimo', 'Ultima Compra', 'Precio Costo Actual']]);
      hoja.getRange('A1:F1').setFontWeight('bold').setBackground('#34a853').setFontColor('white');
      var stockData = [
        [1, 'Coca Cola 500ml', 48, 12, new Date(), 450],
        [2, 'Agua sin gas 500ml', 60, 15, new Date(), 200],
        [3, 'Cerveza Artesanal', 36, 10, new Date(), 600],
        [4, 'Vino Tinto Copa', 24, 6, new Date(), 800],
        [5, 'Gaseosa Linea', 40, 10, new Date(), 350],
        [6, 'Bruschetta', 20, 5, new Date(), 1200],
        [7, 'Tabla de Fiambres', 15, 3, new Date(), 2500],
        [8, 'Milanesa Napolitana', 18, 4, new Date(), 2800],
        [9, 'Pasta Bolognesa', 22, 5, new Date(), 2200],
        [10, 'Parrillada para 2', 10, 2, new Date(), 5500],
        [11, 'Flan Casero', 16, 4, new Date(), 600],
        [12, 'Helado Artesanal', 14, 3, new Date(), 800],
        [13, 'Cafe Expreso', 50, 12, new Date(), 300],
        [14, 'Medialunas x3', 30, 8, new Date(), 500],
        [15, 'Trago del Dia', 20, 5, new Date(), 800]
      ];
      hoja.getRange(2, 1, stockData.length, 6).setValues(stockData);
      break;

    case 'Platos':
      hoja.getRange('A1:G1').setValues([['ID Plato', 'Nombre', 'Categoria', 'Precio Venta', 'Costo Total', 'Margen %', 'Activo']]);
      hoja.getRange('A1:G1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      var platosData = [
        [1, 'Menu del Dia', 'Menu', 4500, 0, 0, 'SI'],
        [2, 'Cena Completa', 'Cena', 6500, 0, 0, 'SI'],
        [3, 'Desayuno Americano', 'Desayuno', 3500, 0, 0, 'SI'],
        [4, 'Parrillada Epecuen', 'Especial', 12000, 0, 0, 'SI'],
        [5, 'Pasta Casera', 'Plato Principal', 5500, 0, 0, 'SI']
      ];
      hoja.getRange(2, 1, platosData.length, 7).setValues(platosData);
      break;

    case 'Recetas':
      hoja.getRange('A1:G1').setValues([['ID Plato', 'Nombre Plato', 'ID Producto', 'Producto', 'Cantidad', 'Unidad', 'Costo']]);
      hoja.getRange('A1:G1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      break;

    case 'Mesas':
      hoja.getRange('A1:K1').setValues([['ID Mesa', 'Nombre', 'Ubicacion', 'Estado', 'ID Comanda Activa', 'Tipo Cliente', 'Nro Habitacion', 'Nombre Cliente', 'Hora Apertura', 'Observaciones', 'Cantidad Comensales']]);
      hoja.getRange('A1:K1').setFontWeight('bold').setBackground('#fbbc04').setFontColor('black');
      var mesasData = [
        [1, 'Mesa 1', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [2, 'Mesa 2', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [3, 'Mesa 3', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [4, 'Mesa 4', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [5, 'Mesa 5', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [6, 'Mesa 6', 'Salon', 'LIBRE', '', '', '', '', '', '', ''],
        [7, 'Ext 1', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', ''],
        [8, 'Ext 2', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', ''],
        [9, 'Ext 3', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', ''],
        [10, 'Ext 4', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', ''],
        [11, 'Ext 5', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', ''],
        [12, 'Ext 6', 'Consumos Externos', 'LIBRE', '', '', '', '', '', '', '']
      ];
      hoja.getRange(2, 1, mesasData.length, 11).setValues(mesasData);
      break;

    case 'Comandas':
      hoja.getRange('A1:N1').setValues([['ID Comanda', 'Fecha', 'Hora Apertura', 'Hora Cierre', 'ID Mesa', 'Mesa', 'Ubicacion', 'Tipo Cliente', 'Nro Habitacion', 'Nombre Cliente', 'Estado', 'Total', 'Observaciones', 'Cantidad Comensales']]);
      hoja.getRange('A1:N1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      break;

    case 'ComandasDetalle':
      hoja.getRange('A1:H1').setValues([['ID Comanda', 'Item', 'ID Producto', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Es Bebida']]);
      hoja.getRange('A1:H1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      break;

    case 'Huespedes':
      hoja.getRange('A1:G1').setValues([['Nro Habitacion', 'Nombre', 'Apellido', 'Tipo Pension', 'Check-in', 'Check-out', 'Activo']]);
      hoja.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      var huespedesData = [
        [101, 'Juan', 'Perez', 'MAP', new Date('2026-06-01'), new Date('2026-06-07'), 'SI'],
        [102, 'Maria', 'Gonzalez', 'SIN MAP', new Date('2026-06-02'), new Date('2026-06-05'), 'SI'],
        [103, 'Carlos', 'Rodriguez', 'MAP', new Date('2026-06-01'), new Date('2026-06-08'), 'SI'],
        [104, 'Ana', 'Lopez', 'SIN MAP', new Date('2026-06-03'), new Date('2026-06-06'), 'SI'],
        [105, 'Pedro', 'Martinez', 'MAP', new Date('2026-06-02'), new Date('2026-06-09'), 'SI']
      ];
      hoja.getRange(2, 1, huespedesData.length, 7).setValues(huespedesData);
      break;

    case 'VouchersCarhue':
      hoja.getRange('A1:L1').setValues([['ID Voucher', 'Fecha', 'Nombre', 'Apellido', 'Nro Habitacion Carhue', 'Tipo Pension', 'Comensales', 'Observaciones', 'Estado', 'Usado En', 'Fecha Uso', 'Creado Por']]);
      hoja.getRange('A1:L1').setFontWeight('bold').setBackground('#34a853').setFontColor('white');
      break;

    case 'Cierres':
      hoja.getRange('A1:N1').setValues([['ID Cierre', 'ID Comanda', 'Fecha', 'Hora', 'Tipo Cliente', 'Nro Habitacion', 'Nombre Cliente', 'Total Bebidas', 'Total Comidas', 'Total General', 'Medio Pago', 'ID Transaccion', 'Descuento %', 'Usuario']]);
      hoja.getRange('A1:N1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      break;

    case 'CierresDetalle':
      hoja.getRange('A1:F1').setValues([['ID Cierre', 'ID Comanda', 'Producto', 'Cantidad', 'Precio', 'Subtotal']]);
      hoja.getRange('A1:F1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      break;

    case 'Cobros':
      hoja.getRange('A1:M1').setValues([['ID Cobro', 'Fecha', 'Hora', 'ID Cierre', 'Tipo Cliente', 'Total', 'Medio Pago', 'ID Transaccion', 'Descuento %', 'Usuario', 'Mesa', 'Nombre Cliente', 'Subtotal']]);
      hoja.getRange('A1:M1').setFontWeight('bold').setBackground('#34a853').setFontColor('white');
      break;

    case 'Usuarios':
      hoja.getRange('A1:D1').setValues([['Usuario', 'Contrasena', 'Rol', 'Nombre Completo']]);
      hoja.getRange('A1:D1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      var usuariosData = [
        ['mozo', 'mozo123', 'MOZO', 'Mozo Salon'],
        ['caja', 'caja123', 'CAJA', 'Cajero Restaurante'],
        ['stock', 'stock123', 'STOCK', 'Encargado Stock'],
        ['chef', 'chef123', 'CHEF', 'Chef Principal'],
        ['admin', 'admin123', 'ADMIN', 'Administrador'],
        ['carhue', 'carhue123', 'CARHUE_RECEPCION', 'Recepcion Hotel Carhue']
      ];
      hoja.getRange(2, 1, usuariosData.length, 4).setValues(usuariosData);
      break;

    case 'HistorialStock':
      hoja.getRange('A1:H1').setValues([['Fecha', 'ID Producto', 'Producto', 'Tipo Movimiento', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Usuario']]);
      hoja.getRange('A1:H1').setFontWeight('bold').setBackground('#34a853').setFontColor('white');
      break;

    case 'AuditoriaEliminaciones':
      hoja.getRange('A1:I1').setValues([['Fecha', 'Hora', 'Usuario', 'Mesa', 'Tipo Cliente', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']]);
      hoja.getRange('A1:I1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      break;

    case 'ConsumosHuespedes':
      hoja.getRange('A1:M1').setValues([['ID Consumo', 'Fecha', 'Hora', 'Nro Habitacion', 'Nombre Cliente', 'Tipo Cliente', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Es Bebida', 'ID Comanda', 'Cantidad Comensales']]);
      hoja.getRange('A1:M1').setFontWeight('bold').setBackground('#9333ea').setFontColor('white');
      break;

    case 'ListadosDiariosCarhue':
      hoja.getRange('A1:I1').setValues([['ID Listado', 'Fecha Envio', 'ID Voucher', 'Nombre', 'Apellido', 'Nro Habitacion Carhue', 'Tipo Pension', 'Comensales', 'Enviado Por']]);
      hoja.getRange('A1:I1').setFontWeight('bold').setBackground('#0f9d58').setFontColor('white');
      break;
  }

  try {
    hoja.autoResizeColumns(1, hoja.getLastColumn() || 1);
  } catch(e) {}
  try {
    SpreadsheetApp.flush();
  } catch(e) {}
}

function getSpreadsheet() {
  // Intentar abrir por ID cacheado (evita busqueda lenta por nombre en Drive)
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch(e) {}
  }
  try {
    const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
    if (files.hasNext()) {
      var ss = SpreadsheetApp.open(files.next());
      props.setProperty('SPREADSHEET_ID', ss.getId());
      return ss;
    }
  } catch(e) {}
  return null;
}

function getHoja(nombre) {
  const ss = getSpreadsheet();
  return ss ? ss.getSheetByName(nombre) : null;
}

function getNuevoID(tipo) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch(e) {
    return 0;
  }
  try {
    const hoja = getHoja('Config');
    if (!hoja) return 0;
    var fila;
    if (tipo === 'comanda') fila = 7;
    else if (tipo === 'cierre') fila = 8;
    else if (tipo === 'voucher') fila = 9;
    else if (tipo === 'listado') fila = 10;
    else return 0;
    var idActual = hoja.getRange(fila, 2).getValue() || 0;
    var nuevoID = parseInt(idActual) + 1;
    hoja.getRange(fila, 2).setValue(nuevoID);
    SpreadsheetApp.flush();
    return nuevoID;
  } catch(e) {
    return 0;
  } finally {
    lock.releaseLock();
  }
}

function login(usuario, password) {
  const hoja = getHoja('Usuarios');
  if (!hoja) return { success: false, error: 'Sistema no inicializado' };
  try {
    var datos = hoja.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][0] === usuario && datos[i][1] === password) {
        return { 
          success: true, 
          usuario: datos[i][0], 
          rol: datos[i][2], 
          nombre: datos[i][3] 
        };
      }
    }
  } catch(e) {
    return { success: false, error: 'Error al verificar usuario' };
  }
  return { success: false, error: 'Usuario o contrasena incorrectos' };
}

// Verificar que el usuario tiene el rol necesario para la operacion
function verificarAutorizacion(datos, nombreFuncion) {
  if (!datos || !datos.usuario) {
    return { autorizado: false, error: 'Usuario no especificado' };
  }
  var rolesPermitidos = CONFIG.ROLES_PERMITIDOS[nombreFuncion];
  if (!rolesPermitidos) return { autorizado: true }; // sin restriccion
  var hoja = getHoja('Usuarios');
  if (!hoja) return { autorizado: false, error: 'No se pudo verificar usuario' };
  var usuarios = hoja.getDataRange().getValues();
  for (var i = 1; i < usuarios.length; i++) {
    if (usuarios[i][0] === datos.usuario) {
      if (rolesPermitidos.indexOf(usuarios[i][2]) !== -1) {
        return { autorizado: true, rol: usuarios[i][2] };
      }
      return { autorizado: false, error: 'No tiene permisos para esta operacion' };
    }
  }
  return { autorizado: false, error: 'Usuario no encontrado' };
}

function getMesas() {
  const hoja = getHoja('Mesas');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var mesas = [];
    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var estado = fila[3] ? String(fila[3]).trim() : 'LIBRE';
      var idComanda = fila[4] ? String(fila[4]).trim() : '';
      var tipoCliente = fila[5] ? String(fila[5]).trim() : '';
      var nroHabitacion = fila[6] ? String(fila[6]).trim() : '';
      var nombreCliente = fila[7] ? String(fila[7]).trim() : '';
      mesas.push({
        id: fila[0],
        nombre: fila[1] ? String(fila[1]) : '',
        ubicacion: fila[2] ? String(fila[2]) : '',
        estado: estado,
        idComanda: idComanda,
        tipoCliente: tipoCliente,
        nroHabitacion: nroHabitacion,
        nombreCliente: nombreCliente,
        horaApertura: fila[8] ? String(fila[8]) : '',
        observaciones: fila[9] ? String(fila[9]) : '',
        cantidadComensales: fila[10] ? parseInt(fila[10]) : 1
      });
    }
    return mesas;
  } catch(e) {
    Logger.log('Error getMesas: ' + e);
    return [];
  }
}

function getProductos() {
  const hoja = getHoja('Productos');
  if (!hoja) return [];
  try {
    // Asegurar columna Sector (I) existe
    var header = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    if (header.length < 9 || header[8] !== 'Sector') {
      hoja.getRange(1, 9).setValue('Sector');
      // Asignar sector a productos existentes sin sector
      var lastRow = hoja.getLastRow();
      if (lastRow > 1) {
        var cats = hoja.getRange(2, 2, lastRow - 1, 1).getValues();
        var secs = hoja.getRange(2, 9, lastRow - 1, 1).getValues();
        var updated = false;
        for (var j = 0; j < secs.length; j++) {
          if (!secs[j][0] || secs[j][0] === '') {
            var cat = cats[j][0];
            secs[j][0] = (['Bebidas','Tragos','Vinos','Cervezas'].indexOf(cat) !== -1) ? 'MOSTRADOR' : 'COCINA';
            updated = true;
          }
        }
        if (updated) hoja.getRange(2, 9, secs.length, 1).setValues(secs);
      }
    }
    var datos = hoja.getDataRange().getValues();
    var productos = [];
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][6] === 'SI') {
        productos.push({
          id: datos[i][0],
          categoria: datos[i][1],
          nombre: datos[i][2],
          unidad: datos[i][3],
          precioCosto: datos[i][4],
          precioVenta: datos[i][5],
          sector: datos[i][8] || ((['Bebidas','Tragos','Vinos','Cervezas'].indexOf(datos[i][1]) !== -1) ? 'MOSTRADOR' : 'COCINA')
        });
      }
    }
    return productos;
  } catch(e) {
    return [];
  }
}

function abrirMesa(datos) {
  var auth = verificarAutorizacion(datos, 'abrirMesa');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaMesas = ss.getSheetByName('Mesas');
    var hojaComandas = ss.getSheetByName('Comandas');
    if (!hojaMesas || !hojaComandas) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    // Validar que no haya otra mesa abierta con mismo nro habitacion
    if (datos.nroHabitacion && datos.nroHabitacion.toString().trim() !== '') {
      var mesasData = hojaMesas.getDataRange().getValues();
      for (var i = 1; i < mesasData.length; i++) {
        var estadoActual = mesasData[i][3] ? String(mesasData[i][3]).trim() : '';
        var habActual = mesasData[i][6] ? String(mesasData[i][6]).trim() : '';
        if (estadoActual !== 'LIBRE' && estadoActual !== '' && habActual === datos.nroHabitacion.toString().trim()) {
          return { 
            success: false, 
            error: 'Ya existe una mesa abierta con el numero de habitacion ' + datos.nroHabitacion 
          };
        }
      }
    }
    // Buscar fila de la mesa
    var mesasData = hojaMesas.getDataRange().getValues();
    var filaMesa = -1;
    for (var i = 1; i < mesasData.length; i++) {
      if (mesasData[i][0] == datos.idMesa) {
        filaMesa = i + 1;
        break;
      }
    }
    if (filaMesa === -1) return { success: false, error: 'Mesa no encontrada' };
    var estadoActual = mesasData[filaMesa - 1][3] ? String(mesasData[filaMesa - 1][3]).trim() : '';
    if (estadoActual !== 'LIBRE') return { success: false, error: 'Mesa no disponible' };
    var idComanda = getNuevoID('comanda');
    var ahora = new Date();
    var nombreCompleto = (datos.apellidoHuesped || '') + ' ' + (datos.nombreHuesped || '');
    nombreCompleto = nombreCompleto.trim();
    // Guardar comanda
    hojaComandas.appendRow([
      idComanda,
      ahora,
      ahora,
      '',
      datos.idMesa,
      mesasData[filaMesa - 1][1],
      mesasData[filaMesa - 1][2],
      datos.tipoCliente,
      datos.nroHabitacion || '',
      nombreCompleto,
      'ABIERTA',
      0,
      datos.observaciones || '',
      datos.cantidadComensales || 1
    ]);
    // Actualizar mesa (batch para mejor rendimiento)
    hojaMesas.getRange(filaMesa, 4, 1, 8).setValues([['OCUPADA', idComanda, datos.tipoCliente, datos.nroHabitacion || '', nombreCompleto, ahora, datos.observaciones || '', datos.cantidadComensales || 1]]);
    SpreadsheetApp.flush();
    var verificacion = hojaMesas.getRange(filaMesa, 4, 1, 7).getValues();
    Logger.log('Mesa ' + datos.idMesa + ' actualizada: ' + JSON.stringify(verificacion[0]));
    return { success: true, idComanda: idComanda };
  } catch(e) {
    Logger.log('Error abrirMesa: ' + e);
    return { success: false, error: e.toString() };
  }
}

function agregarItemComanda(datos) {
  var auth = verificarAutorizacion(datos, 'agregarItemComanda');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaDetalle = ss.getSheetByName('ComandasDetalle');
    var hojaComandas = ss.getSheetByName('Comandas');
    var hojaProductos = ss.getSheetByName('Productos');
    if (!hojaDetalle || !hojaComandas || !hojaProductos) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    // Validar que la comanda no este en FACTURACION
    var comandas = hojaComandas.getDataRange().getValues();
    var estadoComanda = '';
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        estadoComanda = comandas[i][10] ? String(comandas[i][10]).trim() : '';
        break;
      }
    }
    if (estadoComanda === 'FACTURACION') {
      return { success: false, error: 'No se pueden agregar items - La mesa esta en facturacion' };
    }
    // Verificar si es bebida
    var productos = hojaProductos.getDataRange().getValues();
    var esBebida = false;
    var precioCosto = 0;
    for (var i = 1; i < productos.length; i++) {
      if (productos[i][0] == datos.idProducto) {
        esBebida = productos[i][1] === 'Bebidas';
        precioCosto = productos[i][4] || 0;
        break;
      }
    }
    // Agregar item
    hojaDetalle.appendRow([
      datos.idComanda,
      new Date().getTime(),
      datos.idProducto,
      datos.nombreProducto,
      datos.cantidad,
      datos.precio,
      datos.cantidad * datos.precio,
      esBebida ? 'SI' : 'NO'
    ]);
    // Actualizar total de comanda
    var comandas = hojaComandas.getDataRange().getValues();
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        var totalActual = parseFloat(comandas[i][11]) || 0;
        var nuevoTotal = totalActual + (datos.cantidad * datos.precio);
        hojaComandas.getRange(i + 1, 12).setValue(nuevoTotal);
        break;
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getItemsComanda(idComanda) {
  const hoja = getHoja('ComandasDetalle');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var items = [];
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][0] == idComanda) {
        items.push({
          idProducto: datos[i][2],
          producto: datos[i][3],
          cantidad: datos[i][4],
          precio: datos[i][5],
          subtotal: datos[i][6],
          esBebida: datos[i][7]
        });
      }
    }
    return items;
  } catch(e) {
    return [];
  }
}

function eliminarItemComanda(datos) {
  var auth = verificarAutorizacion(datos, 'eliminarItemComanda');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaDetalle = ss.getSheetByName('ComandasDetalle');
    var hojaComandas = ss.getSheetByName('Comandas');
    if (!hojaDetalle || !hojaComandas) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var detalle = hojaDetalle.getDataRange().getValues();
    var filaEliminar = -1;
    var itemEncontrado = null;
    for (var i = 1; i < detalle.length; i++) {
      if (detalle[i][0] == datos.idComanda && 
          detalle[i][2] == datos.idProducto &&
          detalle[i][3] === datos.nombreProducto) {
        filaEliminar = i + 1;
        itemEncontrado = {
          cantidad: detalle[i][4],
          precio: detalle[i][5],
          subtotal: detalle[i][6]
        };
        break;
      }
    }
    if (filaEliminar === -1) {
      return { success: false, error: 'Item no encontrado' };
    }
    hojaDetalle.deleteRow(filaEliminar);
    // Actualizar total de comanda
    var comandas = hojaComandas.getDataRange().getValues();
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        var totalActual = parseFloat(comandas[i][11]) || 0;
        var nuevoTotal = totalActual - itemEncontrado.subtotal;
        if (nuevoTotal < 0) nuevoTotal = 0;
        hojaComandas.getRange(i + 1, 12).setValue(nuevoTotal);
        break;
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function cerrarMesaSinCobro(datos) {
  var auth = verificarAutorizacion(datos, 'cerrarMesaSinCobro');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    var hojaComandas = ss.getSheetByName('Comandas');
    var hojaMesas = ss.getSheetByName('Mesas');
    var hojaConsumos = ss.getSheetByName('ConsumosHuespedes');
    if (!hojaComandas || !hojaMesas || !hojaConsumos) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    // Buscar comanda
    var comandas = hojaComandas.getDataRange().getValues();
    var filaComanda = -1;
    var idMesa = -1;
    var comandaData = null;
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        filaComanda = i + 1;
        idMesa = comandas[i][4];
        comandaData = comandas[i];
        break;
      }
    }
    if (filaComanda === -1) return { success: false, error: 'Comanda no encontrada' };
    var ahora = new Date();
    // Guardar consumos en ConsumosHuespedes para vinculacion futura con modulo de habitaciones
    var items = getItemsComanda(datos.idComanda);
    var idConsumoBase = new Date().getTime();
    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      hojaConsumos.appendRow([
        idConsumoBase + '_' + j,
        ahora,
        Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'HH:mm:ss'),
        comandaData[8] || '',  // nro habitacion
        comandaData[9] || '',  // nombre cliente
        comandaData[7] || '', // tipo cliente
        item.producto,
        item.cantidad,
        item.precio,
        item.subtotal,
        item.esBebida,
        datos.idComanda,
        comandaData[13] || 1  // cantidad comensales
      ]);
    }
    // Cerrar comanda
    hojaComandas.getRange(filaComanda, 4).setValue(ahora);
    hojaComandas.getRange(filaComanda, 11).setValue('CERRADA_SIN_COBRO');
    // Liberar mesa (batch para mejor rendimiento)
    var mesas = hojaMesas.getDataRange().getValues();
    for (var i = 1; i < mesas.length; i++) {
      if (mesas[i][0] == idMesa) {
        hojaMesas.getRange(i + 1, 4, 1, 8).setValues([['LIBRE', '', '', '', '', '', '', '']]);
        break;
      }
    }
    SpreadsheetApp.flush();
    return { success: true };
  } catch(e) {
    Logger.log('Error cerrarMesaSinCobro: ' + e);
    return { success: false, error: e.toString() };
  }
}

function pasarAFacturacion(datos) {
  var auth = verificarAutorizacion(datos, 'pasarAFacturacion');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    var hojaComandas = ss.getSheetByName('Comandas');
    var hojaMesas = ss.getSheetByName('Mesas');
    if (!hojaComandas || !hojaMesas) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var comandas = hojaComandas.getDataRange().getValues();
    var filaComanda = -1;
    var idMesa = -1;
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        filaComanda = i + 1;
        idMesa = comandas[i][4];
        break;
      }
    }
    if (filaComanda === -1) return { success: false, error: 'Comanda no encontrada' };
    hojaComandas.getRange(filaComanda, 11).setValue('FACTURACION');
    var mesas = hojaMesas.getDataRange().getValues();
    for (var i = 1; i < mesas.length; i++) {
      if (mesas[i][0] == idMesa) {
        hojaMesas.getRange(i + 1, 4).setValue('FACTURACION');
        break;
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function facturarMesa(datos) {
  var auth = verificarAutorizacion(datos, 'facturarMesa');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    var hojaComandas = ss.getSheetByName('Comandas');
    var hojaMesas = ss.getSheetByName('Mesas');
    var hojaCierres = ss.getSheetByName('Cierres');
    var hojaCobros = ss.getSheetByName('Cobros');
    var hojaConsumos = ss.getSheetByName('ConsumosHuespedes');
    if (!hojaComandas || !hojaMesas || !hojaCierres || !hojaCobros) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var ahora = new Date();
    var idCierre = getNuevoID('cierre');
    var comandas = hojaComandas.getDataRange().getValues();
    var filaComanda = -1;
    var comandaData = null;
    var idMesa = -1;
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        filaComanda = i + 1;
        comandaData = comandas[i];
        idMesa = comandas[i][4];
        break;
      }
    }
    if (!comandaData) return { success: false, error: 'Comanda no encontrada' };
    var tipoCliente = comandaData[7];
    var total = comandaData[11] || 0;
    // Guardar consumos en ConsumosHuespedes para EPECUEN (para vinculacion futura)
    if (tipoCliente === 'EPECUEN_MAP' || tipoCliente === 'EPECUEN_SIN_MAP') {
      if (hojaConsumos) {
        var items = getItemsComanda(datos.idComanda);
        var idConsumoBase = new Date().getTime();
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          hojaConsumos.appendRow([
            idConsumoBase + '_' + j,
            ahora,
            Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'HH:mm:ss'),
            comandaData[8] || '',
            comandaData[9] || '',
            comandaData[7] || '',
            item.producto,
            item.cantidad,
            item.precio,
            item.subtotal,
            item.esBebida,
            datos.idComanda,
            comandaData[13] || 1
          ]);
        }
      }
    }
    // Guardar en Cierres
    hojaCierres.appendRow([
      idCierre,
      datos.idComanda,
      ahora,
      ahora,
      tipoCliente,
      comandaData[8],
      comandaData[9],
      0,
      0,
      total,
      'EFECTIVO',
      '',
      0,
      datos.usuario
    ]);
    // Guardar en Cobros
    hojaCobros.appendRow([
      idCierre,
      ahora,
      ahora,
      idCierre,
      tipoCliente,
      total,
      'EFECTIVO',
      '',
      0,
      datos.usuario
    ]);
    // Cerrar comanda
    hojaComandas.getRange(filaComanda, 4).setValue(ahora);
    hojaComandas.getRange(filaComanda, 11).setValue('CERRADA');
    // Liberar mesa (batch para mejor rendimiento)
    var mesas = hojaMesas.getDataRange().getValues();
    for (var i = 1; i < mesas.length; i++) {
      if (mesas[i][0] == idMesa) {
        hojaMesas.getRange(i + 1, 4, 1, 8).setValues([['LIBRE', '', '', '', '', '', '', '']]);
        break;
      }
    }
    return { success: true, idCierre: idCierre, total: total };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getMesasPorCobrar() {
  const hojaMesas = getHoja('Mesas');
  const hojaComandas = getHoja('Comandas');
  if (!hojaMesas || !hojaComandas) return [];
  try {
    var datosMesas = hojaMesas.getDataRange().getValues();
    var datosComandas = hojaComandas.getDataRange().getValues();
    // Crear mapa de comandas para busqueda rapida
    var comandasMap = {};
    for (var i = 1; i < datosComandas.length; i++) {
      var idCom = datosComandas[i][0];
      comandasMap[idCom] = datosComandas[i];
    }
    var mesas = [];
    for (var i = 1; i < datosMesas.length; i++) {
      var fila = datosMesas[i];
      var estado = fila[3] ? String(fila[3]).trim() : '';
      if (estado === 'FACTURACION') {
        var idComanda = fila[4] ? String(fila[4]).trim() : '';
        var comanda = comandasMap[idComanda];
        var total = comanda ? (comanda[11] || 0) : 0;
        mesas.push({
          id: fila[0],
          nombre: fila[1] ? String(fila[1]) : '',
          ubicacion: fila[2] ? String(fila[2]) : '',
          estado: estado,
          idComanda: idComanda,
          tipoCliente: fila[5] ? String(fila[5]).trim() : '',
          nroHabitacion: fila[6] ? String(fila[6]).trim() : '',
          nombreCliente: fila[7] ? String(fila[7]).trim() : '',
          totalCuenta: parseFloat(total).toFixed(2),
          cantidadComensales: fila[10] ? parseInt(fila[10]) : 1
        });
      }
    }
    return mesas;
  } catch(e) {
    Logger.log('Error getMesasPorCobrar: ' + e);
    return [];
  }
}

function getTodasLasMesas() {
  const hoja = getHoja('Mesas');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var mesas = [];
    for (var i = 1; i < datos.length; i++) {
      mesas.push({
        id: datos[i][0],
        nombre: datos[i][1] ? String(datos[i][1]) : ''
      });
    }
    return mesas;
  } catch(e) {
    return [];
  }
}

function registrarEliminacionAuditoria(datos) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaAuditoria = ss.getSheetByName('AuditoriaEliminaciones');
    if (!hojaAuditoria) {
      hojaAuditoria = ss.insertSheet('AuditoriaEliminaciones');
      hojaAuditoria.getRange('A1:I1').setValues([['Fecha', 'Hora', 'Usuario', 'Mesa', 'Tipo Cliente', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']]);
      hojaAuditoria.getRange('A1:I1').setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
      SpreadsheetApp.flush();
    }
    var fecha = new Date(datos.fecha);
    var hora = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'HH:mm:ss');
    var fechaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    var subtotal = parseFloat(datos.precio) * parseInt(datos.cantidad);
    hojaAuditoria.appendRow([
      fechaStr,
      hora,
      datos.usuario,
      datos.mesa,
      datos.tipoCliente,
      datos.nombreProducto,
      datos.cantidad,
      parseFloat(datos.precio),
      subtotal
    ]);
    return { success: true };
  } catch(e) {
    Logger.log('Error registrarEliminacionAuditoria: ' + e);
    return { success: false, error: e.toString() };
  }
}

function getHistorialEliminaciones(datos) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var hojaAuditoria = ss.getSheetByName('AuditoriaEliminaciones');
    if (!hojaAuditoria) return [];
    var registros = hojaAuditoria.getDataRange().getValues();
    var resultado = [];
    var fechaFiltro = new Date(datos.fecha);
    var fechaFiltroStr = Utilities.formatDate(fechaFiltro, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    for (var i = 1; i < registros.length; i++) {
      var reg = registros[i];
      var fechaReg = reg[0] ? String(reg[0]).trim() : '';
      var mesaReg = reg[3] ? String(reg[3]).trim() : '';
      if (fechaReg !== fechaFiltroStr) continue;
      if (datos.mesa && datos.mesa !== '' && mesaReg !== datos.mesa) continue;
      resultado.push({
        fecha: fechaReg,
        hora: reg[1] ? String(reg[1]) : '',
        usuario: reg[2] ? String(reg[2]) : '',
        mesa: mesaReg,
        tipoCliente: reg[4] ? String(reg[4]) : '',
        nombreProducto: reg[5] ? String(reg[5]) : '',
        cantidad: reg[6] ? parseInt(reg[6]) : 0,
        precio: reg[7] ? parseFloat(reg[7]) : 0,
        subtotal: reg[8] ? parseFloat(reg[8]) : 0
      });
    }
    return resultado;
  } catch(e) {
    Logger.log('Error getHistorialEliminaciones: ' + e);
    return [];
  }
}

function getCierresPendientes() {
  const hoja = getHoja('Comandas');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var pendientes = [];
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][10] === 'POR COBRAR') {
        pendientes.push({
          idComanda: datos[i][0],
          fecha: datos[i][1],
          mesa: datos[i][5],
          tipoCliente: datos[i][7],
          nroHabitacion: datos[i][8],
          nombreCliente: datos[i][9],
          total: datos[i][11]
        });
      }
    }
    return pendientes;
  } catch(e) {
    return [];
  }
}

function cerrarYFacturar(datos) {
  var auth = verificarAutorizacion(datos, 'cerrarYFacturar');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaComandas = ss.getSheetByName('Comandas');
    var hojaCierres = ss.getSheetByName('Cierres');
    var hojaMesas = ss.getSheetByName('Mesas');
    var hojaCobros = ss.getSheetByName('Cobros');
    if (!hojaComandas || !hojaCierres || !hojaMesas || !hojaCobros) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var ahora = new Date();
    var idCierre = getNuevoID('cierre');
    var comandas = hojaComandas.getDataRange().getValues();
    var filaComanda = -1;
    var comandaData = null;
    for (var i = 1; i < comandas.length; i++) {
      if (comandas[i][0] == datos.idComanda) {
        filaComanda = i + 1;
        comandaData = comandas[i];
        break;
      }
    }
    if (!comandaData) return { success: false, error: 'Comanda no encontrada' };
    var idMesa = comandaData[4];
    var tipoCliente = comandaData[7];
    var items = getItemsComanda(datos.idComanda);
    var totalBebidas = 0;
    var totalComidas = 0;
    items.forEach(function(item) {
      if (item.esBebida === 'SI') {
        totalBebidas += item.subtotal;
      } else {
        totalComidas += item.subtotal;
      }
    });
    var totalACobrar = 0;
    var detalleCobro = '';
    if (tipoCliente === 'EPECUEN_MAP') {
      totalACobrar = totalBebidas;
      detalleCobro = 'Solo bebidas (MAP - cena incluida)';
    } else if (tipoCliente === 'EPECUEN_SIN_MAP') {
      totalACobrar = totalBebidas + totalComidas;
      detalleCobro = 'Todo abona (Sin MAP)';
    } else if (tipoCliente === 'CARHUE') {
      totalACobrar = totalBebidas;
      detalleCobro = 'Solo bebidas (Hotel Carhue)';
    } else {
      totalACobrar = totalBebidas + totalComidas;
      detalleCobro = 'Todo abona (Consumidor Final)';
    }
    var descuentoAplicado = 0;
    if (datos.medioPago === 'EFECTIVO' && datos.descuento > 0) {
      descuentoAplicado = datos.descuento;
      totalACobrar = totalACobrar * (1 - descuentoAplicado / 100);
    }
    hojaCierres.appendRow([
      idCierre,
      datos.idComanda,
      ahora,
      ahora,
      tipoCliente,
      comandaData[8],
      comandaData[9],
      totalBebidas,
      totalComidas,
      totalBebidas + totalComidas,
      datos.medioPago,
      datos.idTransaccion || '',
      descuentoAplicado,
      datos.usuario
    ]);
    hojaCobros.appendRow([
      idCierre,
      ahora,
      ahora,
      idCierre,
      tipoCliente,
      totalACobrar,
      datos.medioPago,
      datos.idTransaccion || '',
      descuentoAplicado,
      datos.usuario
    ]);
    hojaComandas.getRange(filaComanda, 4).setValue(ahora);
    hojaComandas.getRange(filaComanda, 11).setValue('CERRADA');
    var mesas = hojaMesas.getDataRange().getValues();
    for (var i = 1; i < mesas.length; i++) {
      if (mesas[i][0] == idMesa) {
        hojaMesas.getRange(i + 1, 4, 1, 7).setValues([['LIBRE', '', '', '', '', '', '']]);
        break;
      }
    }
    return { 
      success: true, 
      idCierre: idCierre,
      total: totalACobrar,
      detalle: detalleCobro
    };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getCobrosDelDia(fecha) {
  const hoja = getHoja('Cobros');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var cobros = [];
    var fechaBusqueda = new Date(fecha);
    for (var i = 1; i < datos.length; i++) {
      var fechaCobro = new Date(datos[i][1]);
      if (fechaCobro.toDateString() === fechaBusqueda.toDateString()) {
        cobros.push({
          idCobro: datos[i][0],
          hora: datos[i][2],
          tipoCliente: datos[i][4],
          total: datos[i][5],
          medioPago: datos[i][6],
          idTransaccion: datos[i][7],
          descuento: datos[i][8]
        });
      }
    }
    return cobros;
  } catch(e) {
    return [];
  }
}

function getStock() {
  var ss = getSpreadsheet();
  if (!ss) return [];
  try {
    var hojaStock = ss.getSheetByName('Stock');
    var hojaProductos = ss.getSheetByName('Productos');
    if (!hojaStock) return [];
    var datos = hojaStock.getDataRange().getValues();
    var sectores = {};
    if (hojaProductos) {
      var prods = hojaProductos.getDataRange().getValues();
      for (var j = 1; j < prods.length; j++) {
        sectores[prods[j][0]] = prods[j][8] || ((['Bebidas','Tragos','Vinos','Cervezas'].indexOf(prods[j][1]) !== -1) ? 'MOSTRADOR' : 'COCINA');
      }
    }
    var stock = [];
    for (var i = 1; i < datos.length; i++) {
      stock.push({
        idProducto: datos[i][0],
        producto: datos[i][1],
        stockActual: datos[i][2],
        stockMinimo: datos[i][3],
        ultimaCompra: datos[i][4],
        precioCosto: datos[i][5],
        sector: sectores[datos[i][0]] || 'COCINA'
      });
    }
    return stock;
  } catch(e) {
    return [];
  }
}

function getFaltantes() {
  try {
    var stock = getStock();
    return stock.filter(function(item) { return item.stockActual <= item.stockMinimo; });
  } catch(e) {
    return [];
  }
}

function actualizarStock(datos) {
  var auth = verificarAutorizacion(datos, 'actualizarStock');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaStock = ss.getSheetByName('Stock');
    var hojaHistorial = ss.getSheetByName('HistorialStock');
    var hojaProductos = ss.getSheetByName('Productos');
    if (!hojaStock || !hojaHistorial || !hojaProductos) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var stock = hojaStock.getDataRange().getValues();
    var filaStock = -1;
    for (var i = 1; i < stock.length; i++) {
      if (stock[i][0] == datos.idProducto) {
        filaStock = i + 1;
        break;
      }
    }
    if (filaStock === -1) return { success: false, error: 'Producto no encontrado en stock' };
    var stockAnterior = stock[filaStock - 1][2];
    var stockNuevo = stockAnterior + datos.cantidad;
    hojaStock.getRange(filaStock, 3).setValue(stockNuevo);
    hojaStock.getRange(filaStock, 5).setValue(new Date());
    if (datos.nuevoPrecio) {
      hojaStock.getRange(filaStock, 6).setValue(datos.nuevoPrecio);
      var productos = hojaProductos.getDataRange().getValues();
      for (var i = 1; i < productos.length; i++) {
        if (productos[i][0] == datos.idProducto) {
          hojaProductos.getRange(i + 1, 5).setValue(datos.nuevoPrecio);
          hojaProductos.getRange(i + 1, 8).setValue(new Date());
          break;
        }
      }
    }
    hojaHistorial.appendRow([
      new Date(),
      datos.idProducto,
      stock[filaStock - 1][1],
      datos.tipoMovimiento,
      datos.cantidad,
      stockAnterior,
      stockNuevo,
      datos.usuario
    ]);
    return { success: true, stockNuevo: stockNuevo };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getHistorialStock() {
  var hoja = getHoja('HistorialStock');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var historial = [];
    for (var i = 1; i < datos.length; i++) {
      historial.push({
        fecha: datos[i][0],
        idProducto: datos[i][1],
        producto: datos[i][2],
        tipo: datos[i][3],
        cantidad: datos[i][4],
        stockAnterior: datos[i][5],
        stockNuevo: datos[i][6],
        usuario: datos[i][7]
      });
    }
    return historial;
  } catch(e) {
    return [];
  }
}

function agregarProducto(datos) {
  var auth = verificarAutorizacion(datos, 'agregarProducto');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaProductos = ss.getSheetByName('Productos');
    var hojaStock = ss.getSheetByName('Stock');
    if (!hojaProductos || !hojaStock) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var productos = hojaProductos.getDataRange().getValues();
    var maxId = 0;
    for (var i = 1; i < productos.length; i++) {
      if (productos[i][0] > maxId) maxId = productos[i][0];
    }
    var nuevoId = maxId + 1;
    hojaProductos.appendRow([
      nuevoId,
      datos.categoria,
      datos.nombre,
      datos.unidad,
      datos.precioCosto,
      datos.precioVenta,
      'SI',
      new Date(),
      datos.sector || (datos.categoria === 'Bebidas' ? 'MOSTRADOR' : 'COCINA')
    ]);
    hojaStock.appendRow([
      nuevoId,
      datos.nombre,
      datos.stockInicial || 0,
      datos.stockMinimo || 5,
      new Date(),
      datos.precioCosto
    ]);
    return { success: true, idProducto: nuevoId };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getPlatos() {
  const hoja = getHoja('Platos');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var platos = [];
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][6] === 'SI') {
        platos.push({
          id: datos[i][0],
          nombre: datos[i][1],
          categoria: datos[i][2],
          precioVenta: datos[i][3],
          costoTotal: datos[i][4],
          margen: datos[i][5]
        });
      }
    }
    return platos;
  } catch(e) {
    return [];
  }
}

function getReceta(idPlato) {
  const hoja = getHoja('Recetas');
  if (!hoja) return [];
  try {
    var datos = hoja.getDataRange().getValues();
    var receta = [];
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][0] == idPlato) {
        receta.push({
          idProducto: datos[i][2],
          producto: datos[i][3],
          cantidad: datos[i][4],
          unidad: datos[i][5],
          costo: datos[i][6]
        });
      }
    }
    return receta;
  } catch(e) {
    return [];
  }
}

function guardarReceta(datos) {
  var auth = verificarAutorizacion(datos, 'guardarReceta');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'No se pudo acceder al spreadsheet' };
    var hojaRecetas = ss.getSheetByName('Recetas');
    var hojaPlatos = ss.getSheetByName('Platos');
    var hojaProductos = ss.getSheetByName('Productos');
    if (!hojaRecetas || !hojaPlatos || !hojaProductos) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    var recetas = hojaRecetas.getDataRange().getValues();
    var filasAEliminar = [];
    for (var i = recetas.length - 1; i >= 1; i--) {
      if (recetas[i][0] == datos.idPlato) {
        filasAEliminar.push(i + 1);
      }
    }
    filasAEliminar.forEach(function(fila) { hojaRecetas.deleteRow(fila); });
    var platos = hojaPlatos.getDataRange().getValues();
    var nombrePlato = '';
    for (var i = 1; i < platos.length; i++) {
      if (platos[i][0] == datos.idPlato) {
        nombrePlato = platos[i][1];
        break;
      }
    }
    var productos = hojaProductos.getDataRange().getValues();
    var precios = {};
    for (var i = 1; i < productos.length; i++) {
      precios[productos[i][0]] = productos[i][4];
    }
    var costoTotal = 0;
    datos.ingredientes.forEach(function(ing) {
      var costo = (precios[ing.idProducto] || 0) * ing.cantidad;
      costoTotal += costo;
      hojaRecetas.appendRow([
        datos.idPlato,
        nombrePlato,
        ing.idProducto,
        ing.nombre,
        ing.cantidad,
        ing.unidad,
        costo
      ]);
    });
    for (var i = 1; i < platos.length; i++) {
      if (platos[i][0] == datos.idPlato) {
        var precioVenta = platos[i][3];
        var margen = precioVenta > 0 ? ((precioVenta - costoTotal) / precioVenta * 100).toFixed(2) : 0;
        hojaPlatos.getRange(i + 1, 5).setValue(costoTotal);
        hojaPlatos.getRange(i + 1, 6).setValue(margen);
        break;
      }
    }
    return { success: true, costoTotal: costoTotal };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function agregarPlato(datos) {
  var auth = verificarAutorizacion(datos, 'agregarPlato');
  if (!auth.autorizado) return { success: false, error: auth.error };
  try {
    var hoja = getHoja('Platos');
    if (!hoja) return { success: false, error: 'Hoja Platos no encontrada' };
    var platos = hoja.getDataRange().getValues();
    var maxId = 0;
    for (var i = 1; i < platos.length; i++) {
      if (platos[i][0] > maxId) maxId = platos[i][0];
    }
    var nuevoId = maxId + 1;
    hoja.appendRow([
      nuevoId,
      datos.nombre,
      datos.categoria,
      datos.precioVenta,
      0,
      0,
      'SI'
    ]);
    return { success: true, idPlato: nuevoId };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function inicializarManual() {
  try {
    var url = inicializarSistema();
    Logger.log('Sistema inicializado: ' + url);
    return url;
  } catch(e) {
    Logger.log('Error en inicializarManual: ' + e);
    return 'Error: ' + e.toString();
  }
}

function getHistorialCobros(datos) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { cobros: [], resumen: [] };
    var hojaCobros = ss.getSheetByName('Cobros');
    if (!hojaCobros) return { cobros: [], resumen: [] };

    var registros = hojaCobros.getDataRange().getValues();
    var cobros = [];
    var resumenMap = {};
    var fechaFiltro = new Date(datos.fecha);
    var fechaFiltroStr = Utilities.formatDate(fechaFiltro, Session.getScriptTimeZone(), 'dd/MM/yyyy');

    for (var i = 1; i < registros.length; i++) {
      var reg = registros[i];
      var fechaReg = reg[1] ? new Date(reg[1]) : null;
      if (!fechaReg) continue;

      // Comparar solo fecha (sin hora)
      if (fechaReg.getFullYear() !== fechaFiltro.getFullYear() ||
          fechaReg.getMonth() !== fechaFiltro.getMonth() ||
          fechaReg.getDate() !== fechaFiltro.getDate()) {
        continue;
      }

      var medioPago = reg[6] ? String(reg[6]).trim() : '';
      if (datos.medioPago && datos.medioPago !== '' && medioPago !== datos.medioPago) {
        continue;
      }

      var cobro = {
        idCobro: reg[0],
        fecha: fechaReg,
        hora: reg[2] ? String(reg[2]) : '',
        idCierre: reg[3],
        tipoCliente: reg[4] ? String(reg[4]) : '',
        total: parseFloat(reg[5]) || 0,
        medioPago: medioPago,
        idTransaccion: reg[7] ? String(reg[7]) : '',
        descuento: parseFloat(reg[8]) || 0,
        usuario: reg[9] ? String(reg[9]) : '',
        mesa: reg[10] ? String(reg[10]) : '',
        nombreCliente: reg[11] ? String(reg[11]) : '',
        subtotal: parseFloat(reg[12]) || parseFloat(reg[5]) || 0
      };

      cobros.push(cobro);

      // Acumular para resumen
      if (!resumenMap[medioPago]) {
        resumenMap[medioPago] = { medioPago: medioPago, total: 0, cantidad: 0 };
      }
      resumenMap[medioPago].total += cobro.total;
      resumenMap[medioPago].cantidad += 1;
    }

    // Convertir resumen a array
    var resumen = [];
    for (var key in resumenMap) {
      if (resumenMap.hasOwnProperty(key)) {
        resumen.push(resumenMap[key]);
      }
    }

    return { cobros: cobros, resumen: resumen };
  } catch(e) {
    Logger.log('Error getHistorialCobros: ' + e);
    return { cobros: [], resumen: [] };
  }
}

function getCobroPorId(idCobro) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return null;
    var hojaCobros = ss.getSheetByName('Cobros');
    var hojaCierres = ss.getSheetByName('Cierres');
    var hojaCierresDetalle = ss.getSheetByName('CierresDetalle');
    if (!hojaCobros) return null;

    var cobros = hojaCobros.getDataRange().getValues();
    var cobro = null;
    var idCierre = null;

    for (var i = 1; i < cobros.length; i++) {
      if (cobros[i][0] == idCobro) {
        cobro = {
          idCobro: cobros[i][0],
          fecha: cobros[i][1],
          hora: cobros[i][2],
          tipoCliente: cobros[i][4] ? String(cobros[i][4]) : '',
          total: parseFloat(cobros[i][5]) || 0,
          medioPago: cobros[i][6] ? String(cobros[i][6]) : '',
          idTransaccion: cobros[i][7] ? String(cobros[i][7]) : '',
          descuento: parseFloat(cobros[i][8]) || 0,
          usuario: cobros[i][9] ? String(cobros[i][9]) : '',
          mesa: cobros[i][10] ? String(cobros[i][10]) : '',
          nombreCliente: cobros[i][11] ? String(cobros[i][11]) : '',
          subtotal: parseFloat(cobros[i][12]) || parseFloat(cobros[i][5]) || 0
        };
        idCierre = cobros[i][3];
        break;
      }
    }

    if (!cobro) return null;

    // Obtener items del cierre
    var items = [];
    if (hojaCierresDetalle && idCierre) {
      var detalle = hojaCierresDetalle.getDataRange().getValues();
      for (var i = 1; i < detalle.length; i++) {
        if (detalle[i][0] == idCierre) {
          items.push({
            producto: detalle[i][2] ? String(detalle[i][2]) : '',
            cantidad: parseFloat(detalle[i][3]) || 0,
            precio: parseFloat(detalle[i][4]) || 0
          });
        }
      }
    }

    // Si no hay items en CierresDetalle, buscar en ComandasDetalle
    if (items.length === 0 && idCierre) {
      var hojaComandasDetalle = ss.getSheetByName('ComandasDetalle');
      var hojaCierres2 = ss.getSheetByName('Cierres');
      if (hojaCierres2 && hojaComandasDetalle) {
        var cierres = hojaCierres2.getDataRange().getValues();
        var idComanda = null;
        for (var i = 1; i < cierres.length; i++) {
          if (cierres[i][0] == idCierre) {
            idComanda = cierres[i][1];
            break;
          }
        }
        if (idComanda) {
          var comandasDetalle = hojaComandasDetalle.getDataRange().getValues();
          for (var i = 1; i < comandasDetalle.length; i++) {
            if (comandasDetalle[i][0] == idComanda) {
              items.push({
                producto: comandasDetalle[i][3] ? String(comandasDetalle[i][3]) : '',
                cantidad: parseFloat(comandasDetalle[i][4]) || 0,
                precio: parseFloat(comandasDetalle[i][5]) || 0
              });
            }
          }
        }
      }
    }

    cobro.items = items;
    return cobro;
  } catch(e) {
    Logger.log('Error getCobroPorId: ' + e);
    return null;
  }
}

function getReporteComensales(datos) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { resumen: [], comensales: [] };
    var hojaConsumos = ss.getSheetByName('ConsumosHuespedes');
    var hojaComandas = ss.getSheetByName('Comandas');
    if (!hojaConsumos) return { resumen: [], comensales: [] };

    var consumos = hojaConsumos.getDataRange().getValues();
    var fechaFiltro = new Date(datos.fecha);
    var fechaFiltroStr = Utilities.formatDate(fechaFiltro, Session.getScriptTimeZone(), 'dd/MM/yyyy');

    var comensales = [];
    var resumenMap = {};

    // Inicializar resumen para todos los tipos
    var tipos = ['EPECUEN_MAP', 'EPECUEN_SIN_MAP', 'CARHUE', 'EXTERNO'];
    for (var t = 0; t < tipos.length; t++) {
      resumenMap[tipos[t]] = { tipo: tipos[t], comensales: 0, consumos: 0, total: 0 };
    }

    // Mapa para contar comensales unicos por comanda
    var comensalesPorComanda = {};

    for (var i = 1; i < consumos.length; i++) {
      var reg = consumos[i];
      var fechaReg = reg[1] ? new Date(reg[1]) : null;
      if (!fechaReg) continue;

      // Comparar solo fecha
      if (fechaReg.getFullYear() !== fechaFiltro.getFullYear() ||
          fechaReg.getMonth() !== fechaFiltro.getMonth() ||
          fechaReg.getDate() !== fechaFiltro.getDate()) {
        continue;
      }

      var tipoCliente = reg[5] ? String(reg[5]).trim() : '';
      if (datos.tipoCliente && datos.tipoCliente !== '' && tipoCliente !== datos.tipoCliente) {
        continue;
      }

      var idComanda = reg[11] ? String(reg[11]) : '';
      var cantidadComensales = parseInt(reg[12]) || 1;
      var subtotal = parseFloat(reg[9]) || 0;

      // Contar comensales unicos por comanda (solo una vez por comanda)
      if (!comensalesPorComanda[tipoCliente + '_' + idComanda]) {
        comensalesPorComanda[tipoCliente + '_' + idComanda] = true;
        if (resumenMap[tipoCliente]) {
          resumenMap[tipoCliente].comensales += cantidadComensales;
        }
      }

      if (resumenMap[tipoCliente]) {
        resumenMap[tipoCliente].consumos += 1;
        resumenMap[tipoCliente].total += subtotal;
      }

      comensales.push({
        fecha: fechaReg ? Utilities.formatDate(fechaReg, Session.getScriptTimeZone(), 'dd/MM/yyyy') : '',
        hora: reg[2] ? String(reg[2]) : '',
        mesa: '',
        tipoCliente: tipoCliente,
        comensales: cantidadComensales,
        producto: reg[6] ? String(reg[6]) : '',
        cantidad: parseFloat(reg[7]) || 0,
        precio: parseFloat(reg[8]) || 0,
        subtotal: subtotal,
        nroHabitacion: reg[3] ? String(reg[3]) : '',
        nombreCliente: reg[4] ? String(reg[4]) : ''
      });
    }

    // Buscar nombre de mesa en Comandas
    if (hojaComandas && comensales.length > 0) {
      var comandas = hojaComandas.getDataRange().getValues();
      var mesaMap = {};
      for (var i = 1; i < comandas.length; i++) {
        mesaMap[String(comandas[i][0])] = comandas[i][5] ? String(comandas[i][5]) : '';
      }
      for (var i = 0; i < comensales.length; i++) {
        var idCom = consumos[i + 1][11] ? String(consumos[i + 1][11]) : '';
        comensales[i].mesa = mesaMap[idCom] || '';
      }
    }

    // Convertir resumen a array
    var resumen = [];
    for (var key in resumenMap) {
      if (resumenMap.hasOwnProperty(key) && resumenMap[key].consumos > 0) {
        resumen.push(resumenMap[key]);
      }
    }

    return { resumen: resumen, comensales: comensales };
  } catch(e) {
    Logger.log('Error getReporteComensales: ' + e);
    return { resumen: [], comensales: [] };
  }
}

function getReporteCarhue(datos) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { resumen: null, clientes: [] };
    var hojaConsumos = ss.getSheetByName('ConsumosHuespedes');
    if (!hojaConsumos) return { resumen: null, clientes: [] };

    var consumos = hojaConsumos.getDataRange().getValues();
    var mesFiltro = datos.mes; // formato: "2026-06"
    var partes = mesFiltro.split('-');
    var anioFiltro = parseInt(partes[0]);
    var mesFiltroNum = parseInt(partes[1]) - 1; // 0-based
    var clienteFiltro = datos.cliente ? datos.cliente.toLowerCase().trim() : '';

    var clientesMap = {};
    var totalComensales = 0;
    var totalConsumos = 0;
    var totalMonto = 0;

    for (var i = 1; i < consumos.length; i++) {
      var reg = consumos[i];
      var tipoCliente = reg[5] ? String(reg[5]).trim() : '';

      // Solo CARHUE
      if (tipoCliente !== 'CARHUE') continue;

      var fechaReg = reg[1] ? new Date(reg[1]) : null;
      if (!fechaReg) continue;

      // Filtrar por mes
      if (fechaReg.getFullYear() !== anioFiltro || fechaReg.getMonth() !== mesFiltroNum) {
        continue;
      }

      var nombreCliente = reg[4] ? String(reg[4]).trim() : '';
      var nroHabitacion = reg[3] ? String(reg[3]).trim() : '';
      var cantidadComensales = parseInt(reg[12]) || 1;
      var subtotal = parseFloat(reg[9]) || 0;

      // Filtrar por cliente si se especifico
      if (clienteFiltro !== '' && nombreCliente.toLowerCase().indexOf(clienteFiltro) === -1) {
        continue;
      }

      var key = nombreCliente + '_' + nroHabitacion;

      if (!clientesMap[key]) {
        clientesMap[key] = {
          nombre: nombreCliente,
          nroHabitacion: nroHabitacion,
          comensales: 0,
          consumos: 0,
          total: 0,
          visitas: 0,
          visitasSet: {},
          consumosList: []
        };
      }

      var cliente = clientesMap[key];

      // Contar comensales una vez por comanda
      var idComanda = reg[11] ? String(reg[11]) : '';
      var fechaStr = Utilities.formatDate(fechaReg, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      var visitaKey = fechaStr + '_' + idComanda;

      if (!cliente.visitasSet[visitaKey]) {
        cliente.visitasSet[visitaKey] = true;
        cliente.visitas += 1;
        cliente.comensales += cantidadComensales;
        totalComensales += cantidadComensales;
      }

      cliente.consumos += 1;
      cliente.total += subtotal;
      totalConsumos += 1;
      totalMonto += subtotal;

      cliente.consumosList.push({
        fecha: fechaStr,
        hora: reg[2] ? String(reg[2]) : '',
        producto: reg[6] ? String(reg[6]) : '',
        cantidad: parseFloat(reg[7]) || 0,
        precio: parseFloat(reg[8]) || 0,
        subtotal: subtotal
      });
    }

    // Convertir a array
    var clientes = [];
    for (var key in clientesMap) {
      if (clientesMap.hasOwnProperty(key)) {
        var c = clientesMap[key];
        delete c.visitasSet; // no enviar al frontend
        clientes.push(c);
      }
    }

    // Ordenar por total descendente
    clientes.sort(function(a, b) { return b.total - a.total; });

    var resumen = {
      totalComensales: totalComensales,
      totalConsumos: totalConsumos,
      totalClientes: clientes.length,
      totalMonto: totalMonto
    };

    return { resumen: resumen, clientes: clientes };
  } catch(e) {
    Logger.log('Error getReporteCarhue: ' + e);
    return { resumen: null, clientes: [] };
  }
}

// ============================================
// SISTEMA DE VOUCHERS HOTEL CARHUE
// ============================================

function crearVoucherCarhue(datos) {
  var auth = verificarAutorizacion(datos, 'crearVoucherCarhue');
  if (!auth.autorizado) return { success: false, error: auth.error };

  var hoja = getHoja('VouchersCarhue');
  if (!hoja) return { success: false, error: 'Hoja VouchersCarhue no encontrada' };

  try {
    var idVoucher = getNuevoID('voucher');
    if (!idVoucher) return { success: false, error: 'Error al generar ID de voucher' };

    var ahora = new Date();
    hoja.appendRow([
      idVoucher,
      ahora,
      datos.nombre,
      datos.apellido,
      datos.habitacion,
      datos.tipoPension || 'MAP',
      datos.comensales || 1,
      datos.observaciones || '',
      'PENDIENTE',
      '',
      '',
      datos.usuario
    ]);

    SpreadsheetApp.flush();
    return { success: true, idVoucher: idVoucher };
  } catch(e) {
    Logger.log('Error crearVoucherCarhue: ' + e);
    return { success: false, error: 'Error al crear voucher' };
  }
}

function getVouchersDelDia() {
  var hoja = getHoja('VouchersCarhue');
  if (!hoja) return [];

  try {
    var datos = hoja.getDataRange().getValues();
    var hoy = new Date();
    var hoyStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var vouchers = [];

    for (var i = 1; i < datos.length; i++) {
      var fechaVoucher = datos[i][1];
      if (fechaVoucher instanceof Date) {
        var fechaStr = Utilities.formatDate(fechaVoucher, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (fechaStr === hoyStr) {
          vouchers.push({
            id: datos[i][0],
            fecha: fechaStr,
            nombre: datos[i][2],
            apellido: datos[i][3],
            habitacion: datos[i][4],
            tipoPension: datos[i][5],
            comensales: datos[i][6],
            observaciones: datos[i][7],
            estado: datos[i][8]
          });
        }
      }
    }
    return vouchers;
  } catch(e) {
    Logger.log('Error getVouchersDelDia: ' + e);
    return [];
  }
}

function enviarListadoDiarioCarhue(datos) {
  var auth = verificarAutorizacion(datos, 'enviarListadoDiarioCarhue');
  if (!auth.autorizado) return { success: false, error: auth.error };

  var hojaVouchers = getHoja('VouchersCarhue');
  var hojaListados = getHoja('ListadosDiariosCarhue');
  if (!hojaVouchers || !hojaListados) return { success: false, error: 'Hojas no encontradas' };

  try {
    var datosVouchers = hojaVouchers.getDataRange().getValues();
    var hoy = new Date();
    var hoyStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var vouchersHoy = [];

    for (var i = 1; i < datosVouchers.length; i++) {
      var fechaVoucher = datosVouchers[i][1];
      if (fechaVoucher instanceof Date) {
        var fechaStr = Utilities.formatDate(fechaVoucher, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (fechaStr === hoyStr && datosVouchers[i][8] === 'PENDIENTE') {
          vouchersHoy.push({ fila: i + 1, datos: datosVouchers[i] });
        }
      }
    }

    if (vouchersHoy.length === 0) {
      return { success: false, error: 'No hay vouchers pendientes para enviar hoy' };
    }

    var idListado = getNuevoID('listado');
    var filas = [];
    for (var j = 0; j < vouchersHoy.length; j++) {
      var v = vouchersHoy[j].datos;
      filas.push([idListado, hoy, v[0], v[2], v[3], v[4], v[5], v[6], datos.usuario]);
      hojaVouchers.getRange(vouchersHoy[j].fila, 9).setValue('ENVIADO');
    }

    if (filas.length > 0) {
      hojaListados.getRange(hojaListados.getLastRow() + 1, 1, filas.length, 9).setValues(filas);
    }

    SpreadsheetApp.flush();
    return { success: true, cantidad: vouchersHoy.length };
  } catch(e) {
    Logger.log('Error enviarListadoDiarioCarhue: ' + e);
    return { success: false, error: 'Error al enviar listado' };
  }
}

function getListadosDiariosCarhue(fecha) {
  var hoja = getHoja('ListadosDiariosCarhue');
  if (!hoja) return [];

  try {
    var datos = hoja.getDataRange().getValues();
    var listados = [];

    for (var i = 1; i < datos.length; i++) {
      var fechaEnvio = datos[i][1];
      if (fechaEnvio instanceof Date) {
        var fechaStr = Utilities.formatDate(fechaEnvio, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (fechaStr === fecha) {
          listados.push({
            idListado: datos[i][0],
            idVoucher: datos[i][2],
            nombre: datos[i][3],
            apellido: datos[i][4],
            habitacion: datos[i][5],
            tipoPension: datos[i][6],
            comensales: datos[i][7],
            estado: 'ENVIADO'
          });
        }
      }
    }
    return listados;
  } catch(e) {
    Logger.log('Error getListadosDiariosCarhue: ' + e);
    return [];
  }
}

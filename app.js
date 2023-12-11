const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = "localhost"
const MYSQL_DB_USER = "root"
const MYSQL_DB_PASSWORD = ""
const MYSQL_DB_NAME = "o&g"
const MYSQL_DB_PORT = "3306"

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const flowSecundario = addKeyword(['apto', 'casa', 'lote', 'local']).addAnswer('Gracias, en un momento uno de nuestros asesores le comunicará el estado de su cartera')
const flowAsesor = addKeyword(['otro', 'otros'])
    .addAnswer('Por favor espere un momento a que uno de nuestros asesores inicie la conversación')

const flowCartera1 = addKeyword(['soporte'])
    .addAnswer('Por favor envie la imagen correspondiente al comprobante de pago')

const flowCartera2 = addKeyword(['consulta'])
    .addAnswer('Por favor escriba la referencia de su inmueble \n Ejemplo: Casa # Conjunto ______',
        null,
        null, [flowSecundario])

const flowJuridica1 = addKeyword(['soporte'])
    .addAnswer('Por favor envie el archivo multimedia junto con la descripción del concepto de pago', { capture: true }, (ctx) => {})

const flowJuridica2 = addKeyword(['consulta'])
    .addAnswer('Por favor escriba la referencia de su inmueble \n Ejemplo: Casa # Conjunto ______',
        null,
        null, [flowSecundario])

const flow3 = addKeyword(['3']).addAnswer('Haz seleccionado comunicarte con *OTROS*')
    .addAnswer(
        [
            'Por favor espere un momento a que uno de nuestros asesores inicie la conversación'
        ]
    )

const flow2 = addKeyword(['2']).addAnswer('Haz seleccionado comunicarte con el área de *JURIDICA*')
    .addAnswer(
        [
            'Para una mejor atención escoge la razón por la cual se esté comunicando con nosotros',
            '👉 *Consulta* para realizar consultas respecto a un proceso que esté llevando con nosotros',
            '👉 *Cita* para solicitar una cita con alguno de nuestros abogados',
            '👉 *Otro* para comunicarse directamente con un asesor',
        ],
        null,
        null, [flowJuridica1, flowJuridica2, flowAsesor]
    )


const flow1 = addKeyword(['1']).addAnswer('Haz seleccionado comunicarte con el área de *CARTERA*')
    .addAnswer(
        [
            'Para una mejor atención escoge la razón por la cual se esté comunicando con nosotros',
            '👉 *Soporte* para enviar un comprobante de pago',
            '👉 *Consulta*  para solicitar el estado de cartera de su inmueble',
            '👉 *Otro* para comunicarse directamente con un asesor',
        ],
        null,
        null, [flowCartera1, flowCartera2, flowAsesor]
    )


const flowMedia = addKeyword(EVENTS.MEDIA).addAnswer(
    ['Gracias por realizar el envio. \n En un rato uno de nuestros asesores lo revisará y confirmará la recepción'],
    null,
    null, [flowSecundario]
)

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer('Hola, soy *Jurisbot*, el asistente virtual de _O&G Abogados Asociados_')
    .addAnswer(
        [
            'Para una mejor atención escoge él área con quién te requieras comunicar',
            '👉 *1* para el área de _Cartera_',
            '👉 *2*  para el área de _Juridica_',
            '👉 *3* para _otras opciones_',
        ],
        null,
        null, [flow1, flow2, flow3]
    )

const main = async() => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal, flowMedia])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
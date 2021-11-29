/* eslint-disable no-console */
const isProd = process.env.NODE_ENV === 'production'
const print = (output: any, text: any, title: string, styles: Array<string>) =>
    !isProd && output(`${title ? `%c ${title} %c ` : '%c%c'}${text} `, ...styles)

export default {
    error: (text: any, title = ''): typeof print =>
        print(console.error, text, title, ['background: #dd2222; color: #fff', 'color: #dd2222']),
    info: (text: any, title = ''): typeof print =>
        print(console.info, text, title, ['background: #bada55; color: #222', 'color: #bada55'])
}

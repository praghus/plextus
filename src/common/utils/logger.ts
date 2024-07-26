const isProd = process.env.NODE_ENV === 'production'

const styles = {
    error: ['background: #dd2222; color: #fff', 'color: #dd2222'],
    info: ['background: #bada55; color: #222', 'color: #bada55'],
    log: ['background: #2b75cf; color: #222', 'color: #2b75cf'],
    warn: ['background: #eb8100; color: #fff', 'color: #eb8100']
}

const print = (level: 'error' | 'info' | 'log' | 'warn', text: unknown, title: string): void => {
    !isProd && console[level](`${title ? `%c ${title} %c ` : '%c%c'}${text} `, ...styles[level])
}

export default {
    error: (text: unknown, title = '') => print('error', text, title),
    info: (text: unknown, title = '') => print('info', text, title),
    log: (text: unknown, title = '') => print('log', text, title),
    warn: (text: unknown, title = '') => print('warn', text, title)
}

exports.getLocale = (env) => {
    env = env || process.env
    let locale = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE
    return locale
}
((
  { isDebugEnabled } = pipy.solve('config.js'),

  extTypes = ((mime = JSON.decode(pipy.load('files/mime.json'))) => (
    Object.fromEntries(
      Object.keys(mime || {}).map(
        exts => (
          exts.split(' ').filter(o => o).map(
            ext => ([ext, mime[exts]])
          )
        )
      ).flat()
    )
  ))(),

  matchContentType = ext => (
    (ext === '') ? (
      'text/html'
    ) : (
      extTypes?.[ext] || 'application/octet-stream'
    )
  ),

  checkFileMode = filepath => (
    (
      s = os.stat(filepath)
    ) => (
      s ? (
        ((s.mode & 16384) === 16384) ? 1 : 0
      ) : -1
    )
  )(),

  uriCache = new algo.Cache(
    uri => __route && (
      (
        tryFiles = __route.config?.TryFiles && __route.config.TryFiles.map(
          f => (
            (
              e = f.split('/')
            ) => (
              e.map(
                i => i.replace('$uri', uri)
              ).join('/').replace('//', '/')
            )
          )()
        )
      ) => (
        { index: __route.config?.Index, tryFiles }
      )
    )(),
    null,
    { ttl: 3600 }
  ),

  serverCache = new algo.Cache(
    route => (
      uri => uriCache.get(uri)
    )
  ),

  getExt = url => (
    (
      dot = url.lastIndexOf('.'),
      slash = url.lastIndexOf('/'),
    ) => (
      (dot > slash) ? (
        url.substring(dot + 1)
      ) : ''
    )
  )(),

  makeMessage = (uri, indexes) => (
    uri.startsWith('=') ? (
      (
        status = uri.substring(1)
      ) => (
        status > 0 ? (
          new Message({ status })
        ) : (
          new Message({status: 404}, 'Not Found')
        )
      )
    )() : (
      _filepath = __root + uri,
      _mode = checkFileMode(_filepath),
      (_mode === 1) ? (
        indexes && (
          indexes.find(
            i => (
              _filepath.endsWith('/') ? (
                _indexpath = _filepath + i
              ) : (
                _indexpath = _filepath + '/' + i
              ),
              (checkFileMode(_indexpath) === 0) && (_data = os.readFile(_indexpath)) && (
                _message = new Message({ status: 200, headers: { 'content-type': matchContentType(_extName = getExt(_indexpath)) } }, _data),
                _filepath = _indexpath
              )
            )
          )
        )
      ) : (_mode === 0) && (
        (checkFileMode(_filepath) === 0) && (_data = os.readFile(_filepath)) && (
          _message = new Message({ status: 200, headers: { 'content-type': matchContentType(_extName = getExt(uri)) } }, _data)
        )
      ),
      _message
    )
  ),

) => pipy({
  _uri: null,
  _mode: null,
  _file: null,
  _data: null,
  _message: null,
  _extName: null,
  _filepath: null,
  _indexpath: null,
  _serverConfig: null,
})

.export('web-server', {
  __root: null,
})

.import({
  __route: 'route',
})

.pipeline()
.replaceMessage(
  msg => (
    (_uri = msg?.head?.path?.split('?')?.[0]) && (_uri.indexOf('/../') < 0) && (
      _serverConfig = serverCache.get(__route)?.(_uri),

      __root.startsWith('/') ? (
        (_serverConfig?.tryFiles || [_uri]).find(
          tf => (_message = makeMessage(tf, _serverConfig?.index))
        )
      ) : (
        _filepath = 'static/' + __root + _uri,
        [''].concat(_serverConfig?.index || []).find(
          i => (
            (i === '') ? (
              _indexpath = _filepath
            ) : _filepath.endsWith('/') ? (
              _indexpath = _filepath + i
            ) : (
              _indexpath = _filepath + '/' + i
            ),
            _indexpath = _indexpath.replace('//', '/'),
            (_file = http.File.from(_indexpath)) && (
              (_message = _file.toMessage(msg.head?.headers?.['accept-encoding'])) && (
                (_extName = getExt(_indexpath)) && (
                  _message.head.headers['content-type'] = matchContentType(_extName)
                ),
                _filepath = _indexpath
              )
            )
          )
        )
      )
    ),
    _message || new Message({status: 404}, 'Not Found')
  )
)
.branch(
  isDebugEnabled, (
    $=>$.handleMessage(
      msg => (
        console.log('[web-server] _filepath, _extName, status, content-type:', _filepath, _extName, msg?.head?.status, msg?.head?.headers?.['content-type'])
      )
    )
  )
)

)()
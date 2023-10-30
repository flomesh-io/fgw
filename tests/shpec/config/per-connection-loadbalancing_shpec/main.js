((
  // Global variables go here, e.g.:
  // config = pipy.solve('config.js'),
) => pipy()

.listen(8081)
.serveHTTP(new Message('port8081\n'))

.listen(8082)
.serveHTTP(new Message('port8082\n'))

)()


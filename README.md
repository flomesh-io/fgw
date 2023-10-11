# Flomesh Gateway

The Flomesh Gateway (FGW) stands as a high-performance, feature-rich solution for microservice gateways and reverse proxies. Grounded on the robust [Pipy](https://github.com/flomesh-io/pipy) technology, the FGW offers a proficient and adaptable approach, enabling users to fine-tune and govern their intricate network environments with finesse.

## Capabilities of the FGW

Serving as a comprehensive network solution, the FGW furnishes potent support in addressing a myriad of network demands and challenges. It can adeptly replace microservice gateways like Netflix Zuul and Spring Cloud Gateway, and execute functions as a reverse proxy, static web service, and a layer 7 load balancer. Simultaneously, it extends advanced functionalities encompassing API management, authentication, and authorization.

The FGW unveils a gamut of core functionalities that span beyond mere TLS processing, routing, load balancing, traffic control, redirection, and URL rewriting. It embarks upon sophisticated features such as traffic mirroring, tunneling, authentication authorization, and cross-domain integrations, facilitating an exemplary performance in managing diverse network scenarios and security requisites.

The FGW further offers plugin capabilities, permitting extensions and customizations of its functionalities through [Pipy JS](https://flomesh.io/pipy/docs/en/reference/pjs). This level of flexibility enables the FGW to accommodate a diverse array of specific and unique business requirements.

Moreover, the FGW boasts not only formidable features but also extensive compatibility. It supports a variety of computing architectures, encompassing X86, ARM64, Hygon, Loongson, and RISC-V, amongst others, and operates seamlessly across a spectrum of operating systems, including various Linux distributions, FreeBSD, macOS, and domestically produced operating systems.

## Quickstart

FGW has a sample inside. Let's clone the repo first.

Navigate to the project's root directory and execute `pipy`, specifying the entry file `./pjs/main.js`.

```shell
cd fgw
pipy ./pjs/main.js
```

Upon initiating with the default configuration present in the project (`./pjs/config.json`), it will monitor three ports:

  * `8080`: A proxy port orchestrating requests to balance the load amongst the two other static services.
  * `8081`: A static service inaugurated from the `/var/www/html` directory.
  * `8082`: A static service launched from the `static/www2` directory.

> It is important to note that the local `/var/www/html` directory is non-existent, thus attempts to access the service at `8081` will yield a `404` error.

```shell
curl -I localhost:8081
HTTP/1.1 404 Not Found
content-length: 0
connection: keep-alive

curl -I localhost:8082
HTTP/1.1 200 OK
content-type: text/html
content-length: 72
connection: keep-alive
```

When accessing the proxy through port `8080`, a `200` response is received irrespective of both the upstream static services bearing a `50` weightage.

```shell
curl -I localhost:8080
HTTP/1.1 200 OK
content-type: text/html
content-length: 72
set-cookie: _srv_id=3021372512864600; path=/; expires=Fri, 4 Aug 2023 02:23:59 GMT; max-age=3600
connection: keep-alive
```

This behavior is attributable to the configured [health check](https://fgw-docs.flomesh.io/features/healthcheck/) mechanism. The FGW actively conducts health assessments on the upstreams, considering only those with a `200` response status code as healthy, while expunging others from the load balance list.

## Documentation

You can explore the various functionalities of FGW at the [FGW Documentation](https://fgw-docs.flomesh.io). Currently, it is available exclusively in Chinese and is undergoing continuous enhancements, hence you might encounter some blank pages.

All FGW documentation is maintained within the [fgw-docs](https://github.com/flomesh-io/fgw-docs) repository and is crafted using the [Markdown](https://www.markdownguide.org/basic-syntax/) format.

* [Overview](https://fgw-docs.flomesh.io/overview/)
* [Quick Experience](https://fgw-docs.flomesh.io/quickstart/)
* [Getting Started](https://fgw-docs.flomesh.io/getting_started/)
  * [Installation](https://fgw-docs.flomesh.io/getting_started/install/)
* [Features](https://fgw-docs.flomesh.io/features/)
  * [TCP Load Balancing](https://fgw-docs.flomesh.io/features/tcp-load-balancer/)
  * [HTTP/HTTPS Load Balancing](https://fgw-docs.flomesh.io/features/http-load-balancer/)
  * [TLS](https://fgw-docs.flomesh.io/features/tls/)
  * [Policies](https://fgw-docs.flomesh.io/features/policies/)
  * [Static Web Service](https://fgw-docs.flomesh.io/features/static-server/)
  * [Observability](https://fgw-docs.flomesh.io/features/observability/)
* [Reference](https://fgw-docs.flomesh.io/reference/)
  * [Configuration](https://fgw-docs.flomesh.io/reference/configuration/)
  * [Plugins](https://fgw-docs.flomesh.io/reference/plugin/)
* [Releases](https://fgw-docs.flomesh.io/releases/)

## Developer Guide

### Prerequisites

- Pipy
- FGW Repo
- Tools for testing: netstat, cat, grep, openssl, curl, shpec

### Quick Start

All PipyJS scripts are housed in the `pjs` directory. Once FGW is initiated, it will operate in the [Pipy Repo Mode](https://flomesh.io/pipy/docs/en/operating/repo/0-intro) and subsequently publish all the PipyJS scripts into the Repo.

Before commencing, ensure that Pipy is installed. Refer to the [installation documentation](https://flomesh.io/pipy/docs/en/getting-started/build-install) for guidance.

### Build

Execute `make build` to compile FGW. Upon successful compilation, the fgw binary file can be located in the `bin` directory.

### Testing

Within the tests/shpec directory, initially run pre_test.sh to examine the testing environment, and thereafter execute shpec to test all cases.

> The testing works on LINUX ONLY!

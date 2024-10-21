# install local https

- https://github.com/FiloSottile/mkcert

## install guides

```shell
$ brew install mkcert
$ brew install nss # if you use Firefox
```

```
$ mkcert -CAROOT
$ export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```

## Note

本地自签证书支持域名如下
mkcert 127.0.0.1 localhost dev.flatjs.com mock.flatjs.com www.kzfoo.com www.kzfoo.de oss.kzfoo.com www.kzfoo.co.uk www.hyperse.io ::1

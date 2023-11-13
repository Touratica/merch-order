# merch-order

![GitHub release (with filter)](https://img.shields.io/github/v/release/Touratica/merch-order)
![GitHub issues](https://img.shields.io/github/issues/Touratica/merch-order)
![Static Badge](https://img.shields.io/badge/node--lts-%3E%3D16.13-brightgreen)
![Static Badge](https://img.shields.io/badge/license-Unlicensed-%239e9e9e)

<img src="https://merch.korfballx.pt/klx.svg" alt="drawing" width="150"/>

**_merch-order_** is an application built at [Clube Korfball de Lisboa - KLX](https://korfballx.pt) with the purpose of providing a platform in which people can place orders for equipment and/or merchandise. It is publicly available through https://merch.korfballx.pt.

It was developed by [João Pedro Almeida](https://github.com/Touratica), IT Manager at the association, using the Next.js framework.

# Usage

To run the application, execute the following command:

```bash
APP_PORT=[PORT] [STUDIO_PORT=[PORT]] POSTGRES_PASSWORD=[DB_PASSOWORD] docker compose up -d --build
```

If you're running the application <u>for the first time</u>, execute this command instead:

```bash
APP_PORT=[PORT] [STUDIO_PORT=[PORT]] POSTGRES_PASSWORD=[DB_PASSOWORD] docker compose up -d --build && docker exec merch-order-app-1 sh -c "npx prisma migrate deploy && npx node prisma/seed.js"
```

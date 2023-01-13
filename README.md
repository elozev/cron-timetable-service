# cron-timetable-service

This project was generated using the Profile Pensions [express-template](https://github.com/ProfilePensions/express-template) template.

## Config

Configuration values which are not sensitive to exposure should be stored in the `config/[env].json` file for the relevant environment. Default values, used in local development or for values which do not change between environments, should be stored in `config/default.json`. The config file is specified using the helm value key `env.NODE_CONFIG_ENV`. For more information on the config library, see the [config repo](https://github.com/lorenwest/node-config).

## Secrets

Secret values are encrypted and stored in the `helm_vars` directory. Using the Helm plugin, [helm-secrets](https://github.com/futuresimple/helm-secrets), you can store and access encrypted secrets locally. They can be used within your Helm values file by referencing `.Values.KEY_NAME`. Secrets are decrypted at deployment, and you will need to specify which secrets to use within your helm values file with the following key;

```
secretValues:
  DATABASE_PASSWORD: {{ .Values.DATABASE_PASSWORD }}
```

The key represents the key name in your environment variables, and the value is the encrypted secret value key name.

For usage and examples, see the helm-secrets [repo](https://github.com/futuresimple/helm-secrets).
## Serve the dashboard from a bucket

Serve the dashboard from an S3 bucket.

```endpoint
GET /dashboard/{bucket}/{key}
```

This is a way to serve the Cumulus dashboard in a browser from an S3 bucket without making the bucket or files public.

To use this:
- Your dashboard bucket must be in the bucket definitions in your Cumulus `terraform.tfvars`, otherwise you will not be able to access the bucket.
- Deploy the dashboard to your bucket using the instructions in the Cumulus dashboard README.
- In a browser, use the example request below, but replace `example.com` with your Cumulus backend API and `dashboard-bucket` with your bucket name.

#### Example request

```
https://example.com/dashboard/dashboard-bucket/index.html
```

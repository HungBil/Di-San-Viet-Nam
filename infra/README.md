# Infra Notes

This MVP uses Docker Compose only. Keep production deployment concerns out of the hackathon path unless the demo needs them.

Run dev infrastructure from the repository root:

```bash
docker compose --env-file .env -f infra/dev/docker-compose.yml up --build
```

Services:

- `frontend`: browser app
- `backend`: API gateway and mock data owner
- `agent`: AI prompt/story/chat service

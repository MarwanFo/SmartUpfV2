.PHONY: dev dev-backend dev-frontend docker docker-down seed migrate studio test lint build install

dev:
	docker-compose up -d
	start cmd /k "cd backend && npm run start:dev"
	start cmd /k "cd frontend && npm run dev"

dev-backend:
	cd backend && npm run start:dev

dev-frontend:
	cd frontend && npm run dev

docker:
	docker-compose up -d

docker-down:
	docker-compose down

seed:
	cd backend && npx prisma db seed

migrate:
	cd backend && npx prisma migrate dev

studio:
	cd backend && npx prisma studio

test:
	cd backend && npm run test

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

build:
	cd backend && npm run build
	cd frontend && npm run build

install:
	cd backend && npm install
	cd frontend && npm install

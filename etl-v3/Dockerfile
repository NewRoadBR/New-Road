FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /build/target/etl-transito-sp-3.0.0-jar-with-dependencies.jar app.jar
RUN mkdir -p /app/temp_csv
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
# -------- Stage 1: Build the JAR file (Builder) --------
FROM gradle:7.6-jdk17 AS builder
WORKDIR /app

# Copy Gradle files first (for caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies
RUN chmod +x ./gradlew 
RUN ./gradlew dependencies

# Copy the source code
COPY src ./src

# Build the application (skip tests)
RUN ./gradlew build -x test

# -------- Stage 2: Lightweight runtime image --------
FROM eclipse-temurin:17-jre-jammy

RUN addgroup -S spring && adduser -S spring -G spring
WORKDIR /app

# Copy built jar
COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown spring:spring app.jar
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

package com.ecommerce.cart.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.ecommerce.cart.model.Cart;

@Configuration
public class CartConfig {

    @Bean
    public ReactiveRedisTemplate<String, Cart> redisOperations(ReactiveRedisConnectionFactory factory) {

        Jackson2JsonRedisSerializer<Cart> serializer = new Jackson2JsonRedisSerializer<>(Cart.class);

        RedisSerializationContext.SerializationPair<String> keyPair = 
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer());

        RedisSerializationContext.SerializationPair<Cart> valuePair = 
                RedisSerializationContext.SerializationPair.fromSerializer(serializer);

        RedisSerializationContext<String, Cart> context = RedisSerializationContext
                .<String, Cart>newSerializationContext()
                .key(keyPair)
                .value(valuePair)
                .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}

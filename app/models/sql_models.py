from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DECIMAL,
    TIMESTAMP,
    ForeignKey,
    Enum,
    CheckConstraint,
    UniqueConstraint,
    func
)
from sqlalchemy.orm import relationship
from database import Base

from models.sql_enum import RoleEnum, ReportStatusEnum

class Category(Base):
    __tablename__ = 'categories'
    
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    
    # Relationship to restaurants
    restaurants = relationship("Restaurant", back_populates="category", cascade="all, delete", passive_deletes=True)


class Restaurant(Base):
    __tablename__ = 'restaurants'
    
    restaurant_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    picture_url = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"), nullable=False)
    average_rating = Column(DECIMAL(3, 2), default=0.00)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    
    # Relationships
    category = relationship("Category", back_populates="restaurants")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete", passive_deletes=True)
    favorites = relationship("Favorite", back_populates="restaurant", cascade="all, delete", passive_deletes=True)


class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    update_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relationships
    reviews = relationship("Review", back_populates="user", cascade="all, delete", passive_deletes=True)
    likes = relationship("Like", back_populates="user", cascade="all, delete", passive_deletes=True)
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete", passive_deletes=True)
    reports = relationship("Report", back_populates="user", cascade="all, delete", passive_deletes=True)


class Review(Base):
    __tablename__ = 'reviews'
    
    review_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.restaurant_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    
    # Check constraint to ensure rating is between 1 and 5
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="check_rating_between_1_and_5"),
    )
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")
    likes = relationship("Like", back_populates="review", cascade="all, delete", passive_deletes=True)
    reports = relationship("Report", back_populates="review", cascade="all, delete", passive_deletes=True)


class Like(Base):
    __tablename__ = 'likes'
    
    like_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    review_id = Column(Integer, ForeignKey("reviews.review_id", ondelete="CASCADE"), nullable=False)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    
    # Unique constraint to prevent duplicate likes from the same user for a review
    __table_args__ = (
        UniqueConstraint("user_id", "review_id", name="unique_like"),
    )
    
    # Relationships
    user = relationship("User", back_populates="likes")
    review = relationship("Review", back_populates="likes")


class Favorite(Base):
    __tablename__ = 'favorites'
    
    favorite_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.restaurant_id", ondelete="CASCADE"), nullable=False)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    
    # Unique constraint to prevent duplicate favorites
    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", name="unique_favorite"),
    )
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorites")


class Report(Base):
    __tablename__ = 'reports'
    
    report_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    review_id = Column(Integer, ForeignKey("reviews.review_id", ondelete="CASCADE"), nullable=False)
    report_reason = Column(Text, nullable=False)
    report_status = Column(Enum(ReportStatusEnum), nullable=False, default=ReportStatusEnum.pending)
    create_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reports")
    review = relationship("Review", back_populates="reports")
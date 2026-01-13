User model -

{
name: String,
email: String (unique),
password: String (hashed),
timestamps: true
}

Gig Model -

{
title: String,
description: String,
budget: Number,
ownerId: ObjectId (ref: User),
status: String (enum: ['open', 'assigned']),
timestamps: true
}

Bid model -

{
gigId: ObjectId (ref: Gig),
freelancerId: ObjectId (ref: User),
message: String,
price: Number,
status: String (enum: ['pending', 'hired', 'rejected']),
timestamps: true
}

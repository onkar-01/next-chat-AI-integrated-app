import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await req.json();
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "User already exists with this username",
        },
        {
          status: 400,
        }
      );
    }
    const existingUserVerifiedByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.random().toString(36).substring(7);
    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          {
            status: 400,
          }
        );
      } else {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hasedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpire = expiryDate;
        await existingUserVerifiedByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpire: expiryDate,
      });
      await newUser.save();
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "User Registered Successfully. Please verify your email",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error signing up", error);
    return Response.json(
      {
        success: false,
        message: "Error signing up",
      },
      {
        status: 500,
      }
    );
  }
}

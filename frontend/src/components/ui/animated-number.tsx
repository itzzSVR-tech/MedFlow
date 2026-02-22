"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

export function AnimatedNumber({
    value,
    className,
}: {
    value: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, value, isInView]);

    useEffect(() => {
        // Set initial value immediately
        if (ref.current) {
            ref.current.textContent = Intl.NumberFormat("en-US").format(
                Math.floor(springValue.get())
            );
        }

        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(
                    Math.floor(latest)
                );
            }
        });

        return () => unsubscribe();
    }, [springValue]);

    return <span className={className} ref={ref} />;
}
